import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Config } from '@react-router/dev/config';

const configDir = dirname(fileURLToPath(import.meta.url));
const staticPathsFile = join(configDir, 'src', 'generated', 'staticPaths.json');

// Prerender the paths collected at build time by `src/scripts/prepare-prerender.ts`
// (written to `src/generated/staticPaths.json`). When that file is missing — e.g.
// when running typegen or the dev server without first running the collector — fall
// back to the original static resource routes so behavior is unchanged.
const prerender = existsSync(staticPathsFile)
  ? (JSON.parse(readFileSync(staticPathsFile, 'utf-8')) as string[])
  : ['/atom.xml', '/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml'];

export default {
  // The app source lives under `src/` (shared with the rest of the package).
  appDirectory: 'src',
  // Server-side render by default.
  ssr: true,
  // Prerender the collected static paths to static files at build time.
  prerender,
} satisfies Config;
