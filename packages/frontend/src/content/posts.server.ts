import { z } from 'zod';

import type { MdxModule } from './types';

const postSchema = z.object({
  date: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

type PostData = z.infer<typeof postSchema>;

/** Frontmatter data for a post, plus whether it is a draft. */
export type PostEntry = PostData & { isDraft: boolean };

const publishedPostMdx = import.meta.glob<MdxModule>('@@contents/posts/**/*.mdx');
const draftPostMdx = import.meta.glob<MdxModule>('@@contents/post-drafts/**/*.mdx');

const sortByDate = (a: PostEntry, b: PostEntry): number =>
  a.date === b.date ? 0 : a.date < b.date ? 1 : -1;

/** Extract the `date` and `slug` implied by a post's path, which must end in `<date>/<slug>.mdx`. */
const parsePostPath = (path: string): { date: string; slug: string } | undefined => {
  const match = /(\d{4}-\d{2}-\d{2})\/([^/]+)\.mdx$/.exec(path);
  if (!match) return undefined;
  return { date: match[1], slug: match[2] };
};

/**
 * Reject any post whose path slug is used by more than one file (across published and drafts),
 * checking the file paths so no content modules need to be imported.
 */
const assertNoDuplicatePostSlugs = (): void => {
  const seen = new Map<string, string>();
  for (const path of [...Object.keys(publishedPostMdx), ...Object.keys(draftPostMdx)]) {
    const fromPath = parsePostPath(path);
    if (!fromPath) continue;
    const existing = seen.get(fromPath.slug);
    if (existing !== undefined) {
      throw new Error(
        `Duplicate post slug "${fromPath.slug}": used by both "${existing}" and "${path}"`,
      );
    }
    seen.set(fromPath.slug, path);
  }
};

const collect = (
  modules: Record<string, () => Promise<MdxModule>>,
  isDraft: boolean,
): Promise<Array<[string, PostEntry]>> =>
  Promise.all(
    Object.entries(modules).map(async ([path, load]) => {
      const mod = await load();
      const parsed = postSchema.safeParse(mod.frontmatter ?? {});
      if (!parsed.success) {
        throw new Error(`Invalid frontmatter in "${path}":\n${z.prettifyError(parsed.error)}`);
      }
      const fromPath = parsePostPath(path);
      if (!fromPath) {
        throw new Error(
          `Cannot read date and slug from post path "${path}" (expected "<date>/<slug>.mdx")`,
        );
      }
      if (parsed.data.slug !== fromPath.slug) {
        throw new Error(
          `Slug mismatch in "${path}": frontmatter slug "${parsed.data.slug}" does not match path slug "${fromPath.slug}"`,
        );
      }
      if (parsed.data.date !== fromPath.date) {
        throw new Error(
          `Date mismatch in "${path}": frontmatter date "${parsed.data.date}" does not match path date "${fromPath.date}"`,
        );
      }
      return [parsed.data.slug, { ...parsed.data, isDraft }] as const;
    }),
  );

let publishedPostsPromise: Promise<Record<string, PostEntry>> | undefined;
const loadPublishedPosts = (): Promise<Record<string, PostEntry>> => {
  publishedPostsPromise ??= (async (): Promise<Record<string, PostEntry>> => {
    assertNoDuplicatePostSlugs();
    const entries = await collect(publishedPostMdx, false);
    return Object.fromEntries(entries);
  })();
  return publishedPostsPromise;
};

let draftPostsPromise: Promise<Record<string, PostEntry>> | undefined;
const loadDraftPosts = (): Promise<Record<string, PostEntry>> => {
  draftPostsPromise ??= (async (): Promise<Record<string, PostEntry>> => {
    assertNoDuplicatePostSlugs();
    const entries = await collect(draftPostMdx, true);
    return Object.fromEntries(entries);
  })();
  return draftPostsPromise;
};

/** Look up a published post by slug (imports the post modules on first call). */
export const getPost = async (slug: string): Promise<PostEntry | undefined> =>
  (await loadPublishedPosts())[slug];

export const getDraftPost = async (slug: string): Promise<PostEntry | undefined> =>
  (await loadDraftPosts())[slug];

export const getPostSummaries = async (): Promise<PostEntry[]> =>
  Object.values(await loadPublishedPosts()).sort(sortByDate);

export const getDraftPostSummaries = async (): Promise<PostEntry[]> =>
  Object.values(await loadDraftPosts()).sort(sortByDate);
