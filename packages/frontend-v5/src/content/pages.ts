import { z } from 'zod';

import type { MdxComponent, MdxModule } from './types';

// Mirrors v4's `content.config.ts` `pages` schema: a page is a draft unless it
// is explicitly published.
const pageSchema = z
  .object({
    isPublished: z.boolean().default(false),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })
  .transform((data) => ({ ...data, isDraft: !data.isPublished }));

/** Frontmatter data for a page, plus the compiled MDX component. */
export type PageEntry = z.infer<typeof pageSchema> & { Content: MdxComponent };

/**
 * Slug -> page entry map, filled lazily on first access (via `loadPages`) and
 * cached afterwards, so the page modules are only ever imported once — and only
 * when actually needed. Drafts are included; callers decide whether to surface
 * them (see v4, which hides drafts in production).
 */
let pagesPromise: Promise<Record<string, PageEntry>> | undefined;

/**
 * Import every page module and validate its frontmatter against the schema,
 * resolving to the slug -> entry map. The `import.meta.glob` is declared inside
 * this function (not at module scope) and loaded lazily (no `eager`), so no page
 * module is imported until this is first called — each page becomes its own
 * on-demand chunk. Pages are globbed from the `@furtherland/contents` package via
 * the `@@contents` alias (Vite resolves aliases inside `import.meta.glob`
 * patterns). Matching v4 (Astro `glob` loader + zod schema), invalid frontmatter
 * throws rather than being silently skipped; we iterate by file path so the error
 * names the offending file, and a missing frontmatter block is treated as `{}`,
 * which also fails the schema (required fields absent). The page routes call a
 * getter while prerendering, so a bad frontmatter still fails the build.
 */
function loadPages(): Promise<Record<string, PageEntry>> {
  if (!pagesPromise) {
    pagesPromise = (async () => {
      const mdxModules = import.meta.glob<MdxModule>(['@@contents/pages/**/*.mdx']);
      const entries = await Promise.all(
        Object.entries(mdxModules).map(async ([path, load]) => {
          const mod = await load();
          const parsed = pageSchema.safeParse(mod.frontmatter ?? {});
          if (!parsed.success) {
            throw new Error(`Invalid frontmatter in "${path}":\n${z.prettifyError(parsed.error)}`);
          }
          return [parsed.data.slug, { ...parsed.data, Content: mod.default }] as const;
        }),
      );
      return Object.fromEntries(entries);
    })();
  }
  return pagesPromise;
}

/** Look up a page by slug (imports the page modules on first call). */
export async function getPage(slug: string): Promise<PageEntry | undefined> {
  const pages = await loadPages();
  return pages[slug];
}

/**
 * Pages for listing/linking, alphabetically by slug. Drafts are only included
 * outside production (mirrors v4's published-page filtering).
 */
export async function getPageSummaries(): Promise<PageEntry[]> {
  const pages = await loadPages();
  const all = Object.values(pages);
  const visible = import.meta.env.PROD ? all.filter((page) => !page.isDraft) : all;
  return [...visible].sort((l, r) => (l.slug === r.slug ? 0 : l.slug < r.slug ? -1 : 1));
}
