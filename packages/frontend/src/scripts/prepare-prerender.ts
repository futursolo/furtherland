import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type CollectPrerender = () => Promise<string[]>;

const context = import.meta.webpackContext('@@frontend/routes', {
  recursive: true,
  regExp: /\+collectPrerender\.(ts|tsx)$/,
});

const allPaths: string[] = [];
for (const key of context.keys()) {
  const { default: collect } = (await context(key)) as { default: CollectPrerender };
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
