import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { devtools } from '@tanstack/devtools-vite';
import mdx from '@mdx-js/rollup';
import rehypeShiki from '@shikijs/rehype';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const logger = createLogger()
const loggerWarnOnce = logger.warnOnce
logger.warnOnce = (msg, options) => {
  if (msg.includes('Using Yarn PnP with Vite is discouraged and PnP-specific bugs will no longer be actively worked on.')) {
    return
  }
  loggerWarnOnce(msg, options)
}

const config = defineConfig({
  customLogger: logger,
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@@frontend-v5': path.resolve(import.meta.dirname, 'src'),
      '@@contents': path.resolve(import.meta.dirname, '../contents/src'),
      '@@post-components': path.resolve(import.meta.dirname, '../post-components/src'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  plugins: [
    devtools(),
    tanstackStart(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      // Mirrors the v4 (Astro) `markdown.shikiConfig.themes`: dual-theme Shiki
      // highlighting, switched on the client via the `data-theme` attribute.
      rehypePlugins: [[rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }]],
    }),
    viteReact(),
  ],
});

export default config;
