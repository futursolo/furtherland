import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
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
  ssr: true,
  prerender,
} satisfies Config;
