import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import rehypeShiki from '@shikijs/rehype';
import { createLogger, defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

// Vite config used by `vite-node` when running build-time scripts (e.g. the
// prerender path collector) in a plain Node process.
//
// It mirrors `vite.config.ts` (same path aliases, MDX pipeline) but swaps the
// React Router plugin for the standard React plugin. The React Router plugin
// injects a client-only React Fast Refresh runtime into transformed modules when
// Vite runs in "serve" mode (as vite-node does); that runtime references
// `window`, which is undefined in Node. `@vitejs/plugin-react` is safe here.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const logger = createLogger();
const loggerWarnOnce = logger.warnOnce;
logger.warnOnce = (msg, options) => {
  if (
    msg.includes(
      'Using Yarn PnP with Vite is discouraged and PnP-specific bugs will no longer be actively worked on.',
    )
  ) {
    return;
  }

  if (
    msg.includes(
      'Using Yarn PnP with Vite is discouraged and PnP-specific bugs will no longer be actively worked on. Please switch to a different nodeLinker mode or to a different package manager.',
    )
  ) {
    return;
  }
  loggerWarnOnce(msg, options);
};

export default defineConfig({
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
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [[rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }]],
    }),
    react(),
  ],
});
