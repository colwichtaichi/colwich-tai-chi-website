// Post-build checks on dist/. Run automatically by `npm run build`.
// `npm run check:launch` adds the blockers that must be cleared before launch.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const launch = process.argv.includes('--launch');
const dist = new URL('../dist/', import.meta.url).pathname;
const errors = [];
const warnings = [];

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(dist);
const read = (p) => readFileSync(join(dist, p), 'utf8');

const publicPages = ['index.html', 'video-demo.html', 'privacy/index.html'];

for (const page of [...publicPages, '404.html', 'sitemap.xml', 'robots.txt']) {
  if (!existsSync(join(dist, page))) errors.push(`Missing ${page}`);
}

// Nothing from the internal source pack may reach the published output.
const forbiddenNames = /screenshot|selfie|NOT_FOR_PUBLICATION|BUILD_BRIEF|SOURCE_FILE_AUDIT|Comparison|IMG_04|\.txt$/i;
for (const f of files) {
  const rel = relative(dist, f);
  if (rel !== 'robots.txt' && forbiddenNames.test(rel)) errors.push(`Unexpected file in output: ${rel}`);
}

const forbiddenText = [
  /not yet approved/i,
  /NOT FOR PUBLICATION/i,
  /Sun Style/i,
  /5Fy6ztrbi78/, // excluded Sun Style video
  /-0PLvoEx4bE/, // excluded Sun Style video
  /project-samclementsweb/i,
  /build-inputs/i,
];

const htmlFiles = files.filter((f) => f.endsWith('.html')).map((f) => relative(dist, f));
for (const page of htmlFiles) {
  const html = read(page);
  for (const re of forbiddenText) if (re.test(html)) errors.push(`${page}: contains forbidden text ${re}`);

  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) errors.push(`${page}: expected one <h1>, found ${h1s.length}`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) errors.push(`${page}: missing <title>`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) errors.push(`${page}: missing description`);
  if (!/<html lang="en-GB"/.test(html)) errors.push(`${page}: missing lang`);

  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\balt(="|[\s>])/.test(img)) errors.push(`${page}: <img> without alt`);
  }

  // Internal links must resolve to a built file, and #fragments to an id.
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|\/\/)/.test(href)) continue;
    const [path, hash] = href.split('#');
    let target = page;
    if (path) {
      target = path.replace(/^\//, '');
      if (target === '' || target.endsWith('/')) target += 'index.html';
      if (!existsSync(join(dist, target))) {
        errors.push(`${page}: broken internal link ${href}`);
        continue;
      }
    }
    if (hash && target.endsWith('.html') && !read(target).includes(`id="${hash}"`)) {
      errors.push(`${page}: link ${href} has no matching id`);
    }
  }
}

for (const page of publicPages) {
  const html = read(page);
  if (!/<link rel="canonical" href="https:\/\/[^"]+"/.test(html)) errors.push(`${page}: missing absolute canonical`);
  if (!/<meta property="og:image" content="https:\/\/[^"]+"/.test(html)) errors.push(`${page}: missing absolute og:image`);
}

const siteSource = readFileSync(new URL('../src/data/site.ts', import.meta.url), 'utf8');

// robots.txt must be the plain-text rules, not a fallback HTML page.
const robots = read('robots.txt');
const origin = siteSource.match(/origin:\s*'([^']+)'/)?.[1];
const sitemapUrl = origin && new URL('/sitemap.xml', origin).href;
if (/<[a-z!]/i.test(robots)) errors.push('robots.txt contains HTML');
if (!/^User-agent: \*$/m.test(robots)) errors.push('robots.txt is missing the "User-agent: *" rule');
if (!sitemapUrl || !robots.split('\n').includes(`Sitemap: ${sitemapUrl}`)) errors.push(`robots.txt is missing "Sitemap: ${sitemapUrl}"`);

// Fonts must be files on the site: the CSP (font-src 'self') blocks data: fonts.
for (const css of files.filter((f) => f.endsWith('.css'))) {
  const rel = relative(dist, css);
  const text = readFileSync(css, 'utf8');
  if (/url\(\s*["']?data:font/.test(text)) errors.push(`${rel}: inlines a data: font`);
  for (const [, url] of text.matchAll(/url\(\s*["']?(\/[^"')]+\.(?:woff2?|ttf|otf))/g)) {
    if (!existsSync(join(dist, url))) errors.push(`${rel}: font file missing ${url}`);
  }
}

const originConfirmed = /originConfirmed:\s*true/.test(siteSource);
const allowIndexing = /allowIndexing:\s*true/.test(siteSource);
const reviewNotes = htmlFiles.filter((p) => read(p).includes('data-review-note'));
const netlifyToml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
const globalHeaders = netlifyToml.split('for = "/*"')[1]?.split('[[')[0] ?? '';
const noindexHeader = /X-Robots-Tag = "noindex/.test(globalHeaders);

const blockers = [
  !originConfirmed && 'Final origin (www / non-www) not confirmed in src/data/site.ts',
  !allowIndexing && 'Indexing is off (site.allowIndexing = false)',
  noindexHeader && 'netlify.toml still sends X-Robots-Tag: noindex for all pages',
  ...reviewNotes.map((p) => `${p}: review notes still present`),
].filter(Boolean);

if (launch) errors.push(...blockers);
else warnings.push(...blockers.map((b) => `Before launch: ${b}`));

for (const w of warnings) console.log(`  note  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  FAIL  ${e}`);
  console.error(`\ncheck-build: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`check-build: ${htmlFiles.length} HTML pages passed${launch ? ' (launch mode)' : ''}`);
