import { spawn } from 'node:child_process';
import { access, readFile, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config } from '@react-router/dev/config';

const configDir = dirname(fileURLToPath(import.meta.url));
const staticPathsFile = join(configDir, 'src', 'generated', 'staticPaths.json');

async function runPreparePrerender(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      'yarn',
      ['vite-node', '--config', './vite.node.config.ts', 'src/scripts/prepare-prerender.ts'],
      { cwd: configDir, stdio: 'inherit' },
    );
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`prepare-prerender exited with code ${code}`));
      }
    });
  });
}

async function prerender(): Promise<string[]> {
  await runPreparePrerender();
  const contents = await readFile(staticPathsFile, 'utf-8');
  return JSON.parse(contents) as string[];
}

export default {
  appDirectory: 'src',
  ssr: false,
  prerender,
  buildEnd: async ({ reactRouterConfig }) => {
    const clientDir = join(reactRouterConfig.buildDirectory, 'client');
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
