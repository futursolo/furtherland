import { z } from 'zod';

import type { MdxComponent, MdxModule } from './types';

/**
 * All posts, globbed from the `@furtherland/contents` package via the
 * `@@contents` alias (Vite resolves aliases inside `import.meta.glob` patterns).
 * Both the compiled component and the frontmatter are made available at build
 * time, so no `getStaticPaths` (v4's Astro idiom) is needed.
 */
const mdxModules = import.meta.glob<MdxModule>(['@@contents/posts/**/*.mdx'], {
  eager: true,
});

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
export type PostEntry = z.infer<typeof postSchema> & { Content: MdxComponent };

/**
 * Map of slug -> post entry for every post. Drafts are included here; callers
 * decide whether to surface them (see v4, which hides drafts in production and
 * shows them in dev).
 */
export const posts: Record<string, PostEntry> = {};

for (const mod of Object.values(mdxModules)) {
  if (!mod.frontmatter) continue;
  const parsed = postSchema.safeParse(mod.frontmatter);
  if (!parsed.success) continue;
  posts[parsed.data.slug] = { ...parsed.data, Content: mod.default };
}

/** Look up a post by slug. */
export function getPost(slug: string): PostEntry | undefined {
  return posts[slug];
}

/**
 * Posts for the home-page list, newest first. Drafts are only included outside
 * production, mirroring v4's `getCollection('posts', p => !p.isDraft || !PROD)`.
 */
export function getPostSummaries(): PostEntry[] {
  const all = Object.values(posts);
  const visible = import.meta.env.PROD ? all.filter((post) => !post.isDraft) : all;
  return [...visible].sort((l, r) => (l.date === r.date ? 0 : l.date < r.date ? 1 : -1));
}
