import { defineConfig } from 'astro/config';
import { site } from './src/data/site.ts';

export default defineConfig({
  site: site.origin,
  output: 'static',
  // 'preserve' keeps the old /video-demo.html address as a real page.
  build: { format: 'preserve' },
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  // Emit fonts as files rather than data: URLs, which the CSP (font-src 'self')
  // blocks. Other assets keep Vite's default inlining.
  vite: {
    build: { assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined) },
  },
});
