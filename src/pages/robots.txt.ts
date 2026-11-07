import type { APIRoute } from 'astro';
import { site } from '../data/site';

// Crawling stays allowed so search engines can see the noindex directives on
// previews. Indexing is controlled by site.allowIndexing and netlify.toml.
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.origin).href}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
