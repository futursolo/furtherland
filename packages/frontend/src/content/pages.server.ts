import { z } from 'zod';

import type { MdxModule } from './types';

const pageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

type PageData = z.infer<typeof pageSchema>;

/** Frontmatter data for a page, plus whether it is a draft. */
export type PageEntry = PageData & { isDraft: boolean };

const publishedPageMdx = import.meta.glob<MdxModule>('@@contents/pages/**/*.mdx');
const draftPageMdx = import.meta.glob<MdxModule>('@@contents/page-drafts/**/*.mdx');

const sortBySlug = (a: PageEntry, b: PageEntry): number =>
  a.slug === b.slug ? 0 : a.slug < b.slug ? -1 : 1;

/** Extract the `slug` implied by a page's path, which must end in `<slug>.mdx`. */
const parsePagePath = (path: string): string | undefined => {
  const match = /([^/]+)\.mdx$/.exec(path);
  if (!match) return undefined;
  return match[1];
};

/**
 * Reject any page whose path slug is used by more than one file (across published and drafts),
 * checking the file paths so no content modules need to be imported.
 */
const assertNoDuplicatePageSlugs = (): void => {
  const seen = new Map<string, string>();
  for (const path of [...Object.keys(publishedPageMdx), ...Object.keys(draftPageMdx)]) {
    const slug = parsePagePath(path);
    if (!slug) continue;
    const existing = seen.get(slug);
    if (existing !== undefined) {
      throw new Error(`Duplicate page slug "${slug}": used by both "${existing}" and "${path}"`);
    }
    seen.set(slug, path);
  }
};

const collect = (
  modules: Record<string, () => Promise<MdxModule>>,
  isDraft: boolean,
): Promise<Array<[string, PageEntry]>> =>
  Promise.all(
    Object.entries(modules).map(async ([path, load]) => {
      const mod = await load();
      const parsed = pageSchema.safeParse(mod.frontmatter ?? {});
      if (!parsed.success) {
        throw new Error(`Invalid frontmatter in "${path}":\n${z.prettifyError(parsed.error)}`);
      }
      const fromPath = parsePagePath(path);
      if (fromPath === undefined) {
        throw new Error(`Cannot read slug from page path "${path}" (expected "<slug>.mdx")`);
      }
      if (parsed.data.slug !== fromPath) {
        throw new Error(
          `Slug mismatch in "${path}": frontmatter slug "${parsed.data.slug}" does not match path slug "${fromPath}"`,
        );
      }
      return [parsed.data.slug, { ...parsed.data, isDraft }] as const;
    }),
  );

let publishedPagesPromise: Promise<Record<string, PageEntry>> | undefined;
const loadPublishedPages = (): Promise<Record<string, PageEntry>> => {
  publishedPagesPromise ??= (async (): Promise<Record<string, PageEntry>> => {
    assertNoDuplicatePageSlugs();
    const entries = await collect(publishedPageMdx, false);
    return Object.fromEntries(entries);
  })();
  return publishedPagesPromise;
};

let draftPagesPromise: Promise<Record<string, PageEntry>> | undefined;
const loadDraftPages = (): Promise<Record<string, PageEntry>> => {
  draftPagesPromise ??= (async (): Promise<Record<string, PageEntry>> => {
    assertNoDuplicatePageSlugs();
    const entries = await collect(draftPageMdx, true);
    return Object.fromEntries(entries);
  })();
  return draftPagesPromise;
};

/** Look up a published page by slug (imports the page modules on first call). */
export const getPage = async (slug: string): Promise<PageEntry | undefined> =>
  (await loadPublishedPages())[slug];

export const getDraftPage = async (slug: string): Promise<PageEntry | undefined> =>
  (await loadDraftPages())[slug];

export const getPageSummaries = async (): Promise<PageEntry[]> =>
  Object.values(await loadPublishedPages()).sort(sortBySlug);

export const getDraftPageSummaries = async (): Promise<PageEntry[]> =>
  Object.values(await loadDraftPages()).sort(sortBySlug);
