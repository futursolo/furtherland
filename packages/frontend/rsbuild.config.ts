import path from 'node:path';

import { defineConfig } from '@rsbuild/core';
import { pluginMdx } from '@rsbuild/plugin-mdx';
import { pluginReact } from '@rsbuild/plugin-react';
import rehypeShiki from '@shikijs/rehype';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';

// When you update this file, you may also want to update other Rsbuild configs.

export const mdxPlugin = pluginMdx({
  mdxLoaderOptions: {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
    rehypePlugins: [
      [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }],
      rehypeGithubAlerts,
    ],
  },
});

export const baseConfig = {
  resolve: {
    alias: {
      '@@frontend': path.resolve(import.meta.dirname, 'src'),
      '@@common': path.resolve(import.meta.dirname, '../common/src'),
      '@@contents': process.env.FL_CONTENTS_DIR
        ? path.resolve(process.cwd(), process.env.FL_CONTENTS_DIR)
        : path.resolve(import.meta.dirname, '../contents/src'),
      '@@content-components': path.resolve(import.meta.dirname, '../content-components/src'),
      'virtual/react-router': path.resolve(import.meta.dirname, 'node_modules/virtual/react-router'),
    },
  },
};

export default defineConfig({
  ...baseConfig,
  plugins: [mdxPlugin, pluginReact(), pluginReactRouter()],
});
