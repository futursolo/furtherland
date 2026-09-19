import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type CollectPrerender = () => Promise<string[]>;

// Discover every route's `+collectPrerender` module, run its collector, and write
// the union of the returned paths to `src/generated/staticPaths.json`. The React
// Router config reads that file to decide which routes to prerender at build time.
//
// This script is meant to be run with `vite-node` (so `import.meta.glob` and the
// Vite config's aliases/plugins apply) using the dedicated `vite.node.config.ts`:
//   vite-node --config ./vite.node.config.ts src/scripts/prepare-prerender.ts
const collecters = import.meta.glob<{ default: CollectPrerender }>(
  '../routes/**/+collectPrerender.{ts,tsx}',
);

const allPaths: string[] = [];
for (const load of Object.values(collecters)) {
  const { default: collect } = await load();
  allPaths.push(...(await collect()));
}

const staticPaths = [...new Set(allPaths)].sort();

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'generated');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'staticPaths.json'), `${JSON.stringify(staticPaths, null, 2)}\n`);

console.log(`Wrote ${staticPaths.length} prerender path(s) to src/generated/staticPaths.json:`);
for (const path of staticPaths) console.log(`  ${path}`);
process.exit(0);
