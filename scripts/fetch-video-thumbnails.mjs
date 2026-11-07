// Downloads each practice video's YouTube thumbnail into
// src/assets/video-thumbnails/<video id>.jpg so the site serves its own
// optimised copies (no requests to YouTube when the page loads).
// Run after adding or changing a video in src/data/videos.ts.
// Existing files are kept unless --force is passed.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const force = process.argv.includes('--force');
const dir = new URL('../src/assets/video-thumbnails/', import.meta.url);
const source = readFileSync(new URL('../src/data/videos.ts', import.meta.url), 'utf8');
const ids = [...source.matchAll(/youtube\.com\/watch\?v=([\w-]{11})/g)].map((m) => m[1]);

for (const id of ids) {
  const file = new URL(`${id}.jpg`, dir);
  if (existsSync(file) && !force) {
    console.log(`kept     ${id}.jpg`);
    continue;
  }
  // maxresdefault is a true 16:9 frame; smaller sizes are letterboxed 4:3.
  const res = await fetch(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  if (!res.ok) {
    console.error(`FAIL     ${id}: no maxresdefault thumbnail (HTTP ${res.status}). Supply a 16:9 image manually.`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`fetched  ${id}.jpg`);
}
