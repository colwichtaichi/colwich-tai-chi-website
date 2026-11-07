import type { APIRoute } from 'astro';
import { site } from '../data/site';

// Public pages only.
const paths = ['/', '/video-demo.html', '/privacy/'];

export const GET: APIRoute = () => {
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site.origin).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
