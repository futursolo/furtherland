import { z } from 'zod';

import type { MdxModule } from './types';

export const postSchema = z.object({
  date: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

type PostData = z.infer<typeof postSchema>;

/** Frontmatter data for a post, plus whether it is a draft. */
export type PostEntry = PostData & { isDraft: boolean };

const publishedPostMdx = import.meta.glob<MdxModule>('@@contents/posts/**/*.mdx');

const sortByDate = (a: PostEntry, b: PostEntry): number =>
  a.date === b.date ? 0 : a.date < b.date ? 1 : -1;

const collect = (
  modules: Record<string, () => Promise<MdxModule>>,
): Promise<Array<[string, PostEntry]>> =>
  Promise.all(
    Object.entries(modules).map(async ([path, load]) => {
      const mod = await load();
      const parsed = postSchema.safeParse(mod.frontmatter ?? {});
      if (!parsed.success) {
        throw new Error(`Invalid frontmatter in "${path}":\n${z.prettifyError(parsed.error)}`);
      }
      return [parsed.data.slug, { ...parsed.data, isDraft: false }] as const;
    }),
  );

let publishedPostsPromise: Promise<Record<string, PostEntry>> | undefined;
const loadPublishedPosts = (): Promise<Record<string, PostEntry>> => {
  publishedPostsPromise ??= collect(publishedPostMdx).then((entries) =>
    Object.fromEntries(entries),
  );
  return publishedPostsPromise;
};

/** Look up a published post by slug (imports the post modules on first call). */
export const getPost = async (slug: string): Promise<PostEntry | undefined> =>
  (await loadPublishedPosts())[slug];

export const getPostSummaries = async (): Promise<PostEntry[]> =>
  Object.values(await loadPublishedPosts()).sort(sortByDate);
