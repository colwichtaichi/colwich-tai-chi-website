// Checks every external link in dist/ (run `npm run build` first). YouTube
// links are checked through oEmbed, which only succeeds for public videos.
// Some sites (e.g. Facebook) block automated requests; those are reported as
// "check manually" rather than failures.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const urls = new Set();
for (const f of walk(dist).filter((f) => f.endsWith('.html'))) {
  for (const [, href] of readFileSync(f, 'utf8').matchAll(/<a[^>]+href="(https?:[^"]+)"/g)) urls.add(href.replaceAll('&amp;', '&'));
}

const manual = /facebook\.com/;
let failed = 0;
for (const url of [...urls].sort()) {
  const yt = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  const target = yt ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}` : url;
  let status, note = '';
  try {
    const res = await fetch(target, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (link check)' }, signal: AbortSignal.timeout(15000) });
    status = res.status;
    if (yt && res.ok) note = ` — "${(await res.json()).title}"`;
    else if (res.url !== target) note = ` → ${res.url}`;
  } catch (e) {
    status = e.name;
  }
  const ok = typeof status === 'number' && status < 400;
  const label = ok ? 'ok   ' : manual.test(url) ? 'check manually' : 'FAIL ';
  if (!ok && !manual.test(url)) failed++;
  console.log(`${label} ${status} ${url}${note}`);
}
if (failed) process.exit(1);
