import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Explicit alias (not just `tsconfigPaths`) so Vite's Sass importer
      // resolves `@use '@@frontend-v5/...'` inside `.scss` files.
      '@@frontend-v5': resolve(import.meta.dirname, 'src'),
    },
  },
  plugins: [devtools(), tanstackStart(), viteReact()],
})

export default config
