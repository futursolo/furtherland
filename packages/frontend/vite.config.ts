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
      '@@frontend': path.resolve(import.meta.dirname, 'src'),
      '@@common': path.resolve(import.meta.dirname, '../common/src'),
      '@@contents': process.env.FL_CONTENTS_DIR
        ? path.resolve(process.cwd(), process.env.FL_CONTENTS_DIR)
        : path.resolve(import.meta.dirname, '../contents/src'),
      '@@post-components': path.resolve(import.meta.dirname, '../post-components/src'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    devtools(),
    tanstackStart({
      pages: [
        { path: '/atom.xml' },
        { path: '/robots.txt' },
        { path: '/sitemap-index.xml' },
        { path: '/sitemap-0.xml' },
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [[rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }]],
    }),
    viteReact(),
  ],
});

export default config;
