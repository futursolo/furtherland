import { z } from 'zod';

import type { MdxModule } from './types';

// Mirrors v4's `content.config.ts` `posts` schema, including the draft rule
// (a post dated 2099-12-31 is a draft).
const postSchema = z
  .object({
    date: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })
  .transform((data) => ({ ...data, isDraft: data.date === '2099-12-31' }));

/** Frontmatter data for a post, plus the compiled MDX component. */
export type PostEntry = z.infer<typeof postSchema>;

let postsPromise: Promise<Record<string, PostEntry>> | undefined;

const loadPosts = (): Promise<Record<string, PostEntry>> => {
  if (!postsPromise) {
    postsPromise = (async () => {
      const mdxModules = import.meta.glob<MdxModule>(['@@contents/posts/**/*.mdx']);
      const entries = await Promise.all(
        Object.entries(mdxModules).map(async ([path, load]) => {
          const mod = await load();
          const parsed = postSchema.safeParse(mod.frontmatter ?? {});
          if (!parsed.success) {
            throw new Error(`Invalid frontmatter in "${path}":\n${z.prettifyError(parsed.error)}`);
          }
          return [parsed.data.slug, { ...parsed.data }] as const;
        }),
      );
      return Object.fromEntries(entries);
    })();
  }
  return postsPromise;
};

/** Look up a post by slug (imports the post modules on first call). */
export const getPost = async (slug: string): Promise<PostEntry | undefined> => {
  const posts = await loadPosts();
  return posts[slug];
};

export const getPostSummaries = async (): Promise<PostEntry[]> => {
  const posts = await loadPosts();
  const all = Object.values(posts);
  const visible = import.meta.env.PROD ? all.filter((post) => !post.isDraft) : all;
  return [...visible].sort((l, r) => (l.date === r.date ? 0 : l.date < r.date ? 1 : -1));
};
