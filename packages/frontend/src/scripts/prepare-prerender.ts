import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type CollectPrerender = () => Promise<string[]>;

const collecters = import.meta.glob<{ default: CollectPrerender }>(
  '@@frontend/routes/**/+collectPrerender.{ts,tsx}',
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
