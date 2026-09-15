import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { devtools } from '@tanstack/devtools-vite';

import mdx from '@mdx-js/rollup';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';

import { defineConfig } from 'vite';

// The monorepo root (two levels up from this package). Needed so the dev server
// and SSR allow reading content that lives outside this package (e.g. contents/).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: { fs: { allow: [repoRoot] } },
  plugins: [devtools(), tanstackStart(), viteReact(), mdx()],
});

export default config;
