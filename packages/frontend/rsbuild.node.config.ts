import path from 'node:path';

import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

import { baseConfig, mdxPlugin } from './rsbuild.config.ts';

export default defineConfig({
  ...baseConfig,
  source: {
    entry: {
      'prepare-prerender': path.resolve(import.meta.dirname, 'src/scripts/prepare-prerender.ts'),
    },
  },
  output: {
    target: 'node',
    distPath: { root: 'build/scripts' },
    filename: { js: '[name].mjs' },
  },
  plugins: [mdxPlugin, pluginReact()],
});
