import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { reactRouter } from '@react-router/dev/vite';
import mdx from '@mdx-js/rollup';
import rehypeShiki from '@shikijs/rehype';
import { createLogger, defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { rehypeGithubAlerts } from 'rehype-github-alerts'

// When you update this file, you may also want to update other Vite configs.

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const logger = createLogger();
const loggerWarnOnce = logger.warnOnce;
logger.warnOnce = (msg, options) => {
  if (
    msg.includes(
      'Using Yarn PnP with Vite is discouraged and PnP-specific bugs will no longer be actively worked on.',
    )
  ) {
    return;
  }
  loggerWarnOnce(msg, options);
};

export const mdxPlugin = mdx({
  remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
  rehypePlugins: [[rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }], rehypeGithubAlerts],
});

export const baseConfig = {
  customLogger: logger,
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@@frontend': path.resolve(import.meta.dirname, 'src'),
      '@@common': path.resolve(import.meta.dirname, '../common/src'),
      '@@contents': process.env.FL_CONTENTS_DIR
        ? path.resolve(process.cwd(), process.env.FL_CONTENTS_DIR)
        : path.resolve(import.meta.dirname, '../contents/src'),
      '@@content-components': path.resolve(import.meta.dirname, '../content-components/src'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
};

export default defineConfig({
  ...baseConfig,
  plugins: [mdxPlugin, reactRouter()],
});
