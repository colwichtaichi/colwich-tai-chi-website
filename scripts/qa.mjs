// Browser QA against the built site: run `npm run build` first, then `npm run qa`.
// Serves dist/ via `astro preview`, then for each page and viewport checks for
// horizontal overflow, console errors, broken images and axe accessibility
// violations, and saves full-page screenshots to qa-output/.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = 4329;
const base = `http://127.0.0.1:${port}`;
const out = new URL('../qa-output/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const pages = [
  ['home', '/'],
  ['videos', '/video-demo.html'],
  ['privacy', '/privacy/'],
  ['404', '/404.html'],
];
const viewports = [
  ['320', { width: 320, height: 640 }],
  ['390', { width: 390, height: 844 }],
  ['768', { width: 768, height: 1024 }],
  ['1280', { width: 1280, height: 900 }],
];

const server = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', String(port)], { stdio: 'ignore' });
const failures = [];
const fail = (msg) => failures.push(msg);

try {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }

  // Uses installed Google Chrome; falls back to Playwright's bundled browser.
  const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
  for (const [vpName, viewport] of viewports) {
    const context = await browser.newContext({ viewport });
    for (const [name, path] of pages) {
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
      const res = await page.goto(base + path, { waitUntil: 'networkidle' });
      if (name !== '404' && res?.status() !== 200) fail(`${name}@${vpName}: HTTP ${res?.status()}`);

      // Load lazy images before measuring.
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = 'eager';
        await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
      });

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) fail(`${name}@${vpName}: horizontal overflow ${overflow}px`);

      const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.currentSrc || i.src));
      if (broken.length) fail(`${name}@${vpName}: broken images ${broken.join(', ')}`);

      if (consoleErrors.length) fail(`${name}@${vpName}: console errors ${consoleErrors.join(' | ')}`);

      if (vpName === '390' || vpName === '1280') {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        for (const v of axe.violations) fail(`${name}@${vpName}: axe ${v.id} (${v.nodes.length}) ${v.help}`);
      }

      await page.screenshot({ path: `${out}${name}-${vpName}.png`, fullPage: true });
      await page.close();
    }
    await context.close();
  }

  // Mobile menu: opens, is keyboard reachable, closes on Escape and returns focus.
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(base + '/');
    const toggle = page.locator('.menu-toggle');
    if (!(await toggle.isVisible())) fail('menu: toggle hidden on mobile');
    if (await page.locator('#site-nav').isVisible()) fail('menu: nav visible before opening');
    await toggle.focus();
    await page.keyboard.press('Enter');
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') fail('menu: aria-expanded not true after Enter');
    if (!(await page.locator('#site-nav a', { hasText: 'Practice videos' }).isVisible())) fail('menu: links not visible when open');
    await page.screenshot({ path: `${out}menu-open-390.png` });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    if ((await toggle.getAttribute('aria-expanded')) !== 'false') fail('menu: Escape did not close');
    if (!(await toggle.evaluate((el) => el === document.activeElement))) fail('menu: focus not returned to toggle');
    await page.close();
  }

  // Keyboard: first Tab reaches the skip link, which moves focus to main.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(base + '/');
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
    if (first !== 'Skip to main content') fail(`keyboard: first tab stop is "${first}"`);
    await page.keyboard.press('Enter');
    const focused = await page.evaluate(() => document.activeElement?.id);
    if (focused !== 'main') fail(`keyboard: skip link focused "${focused}"`);
    await page.keyboard.press('Tab');
    await page.screenshot({ path: `${out}focus-1280.png` });
    await page.close();
  }

  await browser.close();
} finally {
  server.kill();
  // Astro 7 detaches its preview server; stop it explicitly.
  spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
}

if (failures.length) {
  for (const f of failures) console.error(`  FAIL  ${f}`);
  console.error(`\nqa: ${failures.length} problem(s). Screenshots in qa-output/`);
  process.exit(1);
}
console.log(`qa: ${pages.length} pages × ${viewports.length} viewports passed. Screenshots in qa-output/`);
