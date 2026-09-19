import type { Config } from '@react-router/dev/config';

export default {
  // The app source lives under `src/` (shared with the rest of the package).
  appDirectory: 'src',
  // Server-side render by default.
  ssr: true,
  // Prerender the non-HTML resource routes to static files at build time.
  prerender: ['/atom.xml', '/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml'],
} satisfies Config;
