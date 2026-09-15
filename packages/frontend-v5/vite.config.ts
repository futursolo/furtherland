import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { devtools } from '@tanstack/devtools-vite';
import mdx from '@mdx-js/rollup';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

// The monorepo root (two levels up from this package). Needed so the dev server
// and SSR allow reading content that lives outside this package (e.g. the
// sibling @furtherland/contents package).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Explicit alias (not just `tsconfigPaths`) so Vite's Sass importer
      // resolves `@use '@@frontend-v5/...'` inside `.scss` files.
      '@@frontend-v5': path.resolve(import.meta.dirname, 'src'),
      // Content now lives in the sibling @furtherland/contents package.
      '@@contents': path.resolve(import.meta.dirname, '../contents/src'),
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
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    viteReact(),
  ],
});

export default config;
