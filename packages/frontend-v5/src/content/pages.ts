import { z } from 'zod';

import type { MdxComponent, MdxModule } from './types';

/**
 * All standalone pages, globbed from the `@furtherland/contents` package via the
 * `@@contents` alias (Vite resolves aliases inside `import.meta.glob` patterns).
 */
const mdxModules = import.meta.glob<MdxModule>(['@@contents/pages/**/*.mdx'], {
  eager: true,
});

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
 * Map of slug -> page entry for every page. Drafts are included here; callers
 * decide whether to surface them (see v4, which hides drafts in production).
 */
export const pages: Record<string, PageEntry> = {};

for (const mod of Object.values(mdxModules)) {
  if (!mod.frontmatter) continue;
  const parsed = pageSchema.safeParse(mod.frontmatter);
  if (!parsed.success) continue;
  pages[parsed.data.slug] = { ...parsed.data, Content: mod.default };
}

/** Look up a page by slug. */
export function getPage(slug: string): PageEntry | undefined {
  return pages[slug];
}

/**
 * Pages for listing/linking, alphabetically by slug. Drafts are only included
 * outside production (mirrors v4's published-page filtering).
 */
export function getPageSummaries(): PageEntry[] {
  const all = Object.values(pages);
  const visible = import.meta.env.PROD ? all.filter((page) => !page.isDraft) : all;
  return [...visible].sort((l, r) => (l.slug === r.slug ? 0 : l.slug < r.slug ? -1 : 1));
}
