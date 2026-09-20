import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type CollectPrerender = () => Promise<string[]>;

const collecters = import.meta.glob<{ default: CollectPrerender }>(
  '@@frontend/routes/**/+collectPrerender.{ts,tsx}',
);

const allPaths: string[] = [];
for (const load of Object.values(collecters)) {
  const { default: collect } = await load();
  for (const path of await collect()) {
    allPaths.push(path);
    console.log(path);
  }
}

const staticPaths = [...new Set(allPaths)].sort();

const outDir = join(process.cwd(), 'src', 'generated');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'staticPaths.json'), `${JSON.stringify(staticPaths, null, 2)}\n`);

console.log(`Wrote ${staticPaths.length} prerender path(s) to src/generated/staticPaths.json`);
process.exit(0);
