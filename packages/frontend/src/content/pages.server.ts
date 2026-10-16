import { z } from 'zod';

import type { MdxModule } from './types';

export const pageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

type PageData = z.infer<typeof pageSchema>;

/** Frontmatter data for a page, plus whether it is a draft. */
export type PageEntry = PageData & { isDraft: boolean };

const publishedPageMdx = import.meta.glob<MdxModule>('@@contents/pages/**/*.mdx');

const sortBySlug = (a: PageEntry, b: PageEntry): number =>
  a.slug === b.slug ? 0 : a.slug < b.slug ? -1 : 1;

const collect = (
  modules: Record<string, () => Promise<MdxModule>>,
): Promise<Array<[string, PageEntry]>> =>
  Promise.all(
    Object.entries(modules).map(async ([path, load]) => {
      const mod = await load();
      const parsed = pageSchema.safeParse(mod.frontmatter ?? {});
      if (!parsed.success) {
        throw new Error(`Invalid frontmatter in "${path}":\n${z.prettifyError(parsed.error)}`);
      }
      return [parsed.data.slug, { ...parsed.data, isDraft: false }] as const;
    }),
  );

let publishedPagesPromise: Promise<Record<string, PageEntry>> | undefined;
const loadPublishedPages = (): Promise<Record<string, PageEntry>> => {
  publishedPagesPromise ??= collect(publishedPageMdx).then((entries) =>
    Object.fromEntries(entries),
  );
  return publishedPagesPromise;
};

/** Look up a published page by slug (imports the page modules on first call). */
export const getPage = async (slug: string): Promise<PageEntry | undefined> =>
  (await loadPublishedPages())[slug];

export const getPageSummaries = async (): Promise<PageEntry[]> =>
  Object.values(await loadPublishedPages()).sort(sortBySlug);
