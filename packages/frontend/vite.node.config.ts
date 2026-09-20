import { baseConfig, mdxPlugin } from './vite.config';

import { defineConfig } from 'vite';

export default defineConfig({
  ...baseConfig,
  build: {
    ssr: 'src/scripts/prepare-prerender.ts',
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'prepare-prerender.mjs',
        codeSplitting: false,
      },
    },
  },
  plugins: [mdxPlugin],
});
