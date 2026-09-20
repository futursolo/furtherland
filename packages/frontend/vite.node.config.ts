import { baseConfig, mdxPlugin } from './vite.config';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  ...baseConfig,
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [mdxPlugin, react()],
});
