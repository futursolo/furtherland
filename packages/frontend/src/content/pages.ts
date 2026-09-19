import { z } from 'zod';

import type { MdxModule } from './types';

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
export type PageEntry = z.infer<typeof pageSchema>;

let pagesPromise: Promise<Record<string, PageEntry>> | undefined;

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
          return [parsed.data.slug, { ...parsed.data }] as const;
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

export async function getPageSummaries(): Promise<PageEntry[]> {
  const pages = await loadPages();
  const all = Object.values(pages);
  const visible = import.meta.env.PROD ? all.filter((page) => !page.isDraft) : all;
  return [...visible].sort((l, r) => (l.slug === r.slug ? 0 : l.slug < r.slug ? -1 : 1));
}
