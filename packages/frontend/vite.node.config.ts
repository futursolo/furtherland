import { baseConfig, mdxPlugin } from './vite.config.ts';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

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
  plugins: [mdxPlugin, react()],
});
