import { z } from 'zod';

import { type PageEntry, pageSchema } from './pages.server';
import type { MdxModule } from './types';

// The draft glob lives in its own module so that, once the draft routes are
// filtered out of the production route tree, no production client-bundle
// module references the draft MDX chunks (the home loader reaches this
// module only through a development-only dynamic import).
const draftPageMdx = import.meta.glob<MdxModule>('@@contents/page-drafts/**/*.mdx');

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
      return [parsed.data.slug, { ...parsed.data, isDraft: true }] as const;
    }),
  );

let draftPagesPromise: Promise<Record<string, PageEntry>> | undefined;
const loadDraftPages = (): Promise<Record<string, PageEntry>> => {
  draftPagesPromise ??= collect(draftPageMdx).then((entries) => Object.fromEntries(entries));
  return draftPagesPromise;
};

/** Look up a draft page by slug (imports the page modules on first call). */
export const getDraftPage = async (slug: string): Promise<PageEntry | undefined> =>
  (await loadDraftPages())[slug];

export const getDraftPageSummaries = async (): Promise<PageEntry[]> =>
  Object.values(await loadDraftPages()).sort(sortBySlug);
