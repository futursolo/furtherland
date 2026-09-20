import { access, readdir, readFile, rename, rmdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from '@react-router/dev/config';

const configDir = dirname(fileURLToPath(import.meta.url));
const staticPathsFile = join(configDir, 'src', 'generated', 'staticPaths.json');

const prerender = async (): Promise<string[]> => {
  if (process.env.FL_BUILDING !== 'true') {
    return [];
  }
  const contents = await readFile(staticPathsFile, 'utf-8');
  return JSON.parse(contents) as string[];
};

const removeEmptyDirs = async (dir: string): Promise<void> => {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const child = join(dir, entry.name);
    await removeEmptyDirs(child);
    const remaining = await readdir(child);
    if (remaining.length === 0) {
      await rmdir(child);
    }
  }
};

export default {
  appDirectory: 'src',
  ssr: process.env.FL_BUILDING !== 'true',
  prerender,
  buildEnd: async ({ reactRouterConfig }) => {
    const clientDir = join(reactRouterConfig.buildDirectory, 'client');
    try {
      await access(clientDir);
    } catch {
      return;
    }
    for (const path of await prerender()) {
      if (path.endsWith('/')) continue;
      const dir = join(clientDir, path);
      const indexFile = join(dir, 'index.html');
      try {
        await access(indexFile);
      } catch {
        continue;
      }
      const target = join(dirname(dir), `${basename(dir)}.html`);
      await rename(indexFile, target);
      console.log(`Moved ${path}/index.html -> ${path}.html`);
    }
    await removeEmptyDirs(clientDir);
    const spaFallback = join(clientDir, '__spa-fallback.html');
    const notFound = join(clientDir, '404.html');
    try {
      await access(spaFallback);
    } catch {
      return;
    }
    await rename(spaFallback, notFound);
    console.log('Renamed __spa-fallback.html -> 404.html');
  },
} satisfies Config;
