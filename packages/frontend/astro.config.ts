import { join, resolve } from 'node:path';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Collected during the build (while the Astro module runner is open) so the
// sitemap's `serialize` — which runs in `astro:build:done`, after the runner is
// closed — can look up a post's date without re-importing `astro:content`.
const postDates = new Map<string, string>();
const loadPostDates = async () => {
  const { getCollection } = await import('astro:content');
  for (const post of await getCollection('posts')) {
    postDates.set(post.data.slug, post.data.date);
  }
};

const sitemapIntegration = sitemap({
  // The 404 page is marked `noindex`, so it should not be listed in the sitemap.
  filter: (page) => !page.endsWith('/404'),
  serialize: (item) => {
    const { pathname } = new URL(item.url);
    const match = pathname.match(/^\/posts\/([^/]+)\/?$/);
    const date = match ? postDates.get(match[1]) : undefined;
    if (date) item.lastmod = new Date(date).toISOString();
    return item;
  },
});
sitemapIntegration.hooks['astro:build:content'] = loadPostDates;

export default defineConfig({
  site: 'https://www.futures.moe',
  output: 'static',
  integrations: [react(), mdx(), sitemapIntegration],
  vite: {
    resolve: {
      alias: {
        '@@frontend': resolve(join(import.meta.dirname, 'src')),
      },
    },
    define: {
      'import.meta.projectDir': `"${resolve(join(import.meta.dirname, '..', '..'))}"`,
      'import.meta.contentsDir': `"${
        process.env.FL_CONTENTS_DIR
          ? resolve(process.cwd(), process.env.FL_CONTENTS_DIR)
          : resolve(join(import.meta.dirname, '..', '..', 'contents'))
      }"`,
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  outDir: 'build/client',
  build: {
    format: 'preserve',
  },
  // build: {
  //   assetsPrefix: '/',
  //   inlineStyles: 'header',
  // },
});
