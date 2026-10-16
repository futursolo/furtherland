import { z } from 'zod';

import { type PostEntry, postSchema } from './posts.server';
import type { MdxModule } from './types';

// The draft glob lives in its own module so that, once the draft routes are
// filtered out of the production route tree, no production client-bundle
// module references the draft MDX chunks (the home loader reaches this
// module only through a development-only dynamic import).
const draftPostMdx = import.meta.glob<MdxModule>('@@contents/post-drafts/**/*.mdx');

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
      return [parsed.data.slug, { ...parsed.data, isDraft: true }] as const;
    }),
  );

let draftPostsPromise: Promise<Record<string, PostEntry>> | undefined;
const loadDraftPosts = (): Promise<Record<string, PostEntry>> => {
  draftPostsPromise ??= collect(draftPostMdx).then((entries) => Object.fromEntries(entries));
  return draftPostsPromise;
};

/** Look up a draft post by slug (imports the post modules on first call). */
export const getDraftPost = async (slug: string): Promise<PostEntry | undefined> =>
  (await loadDraftPosts())[slug];

export const getDraftPostSummaries = async (): Promise<PostEntry[]> =>
  Object.values(await loadDraftPosts()).sort(sortByDate);
