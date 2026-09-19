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

/**
 * Slug -> post entry map, filled lazily on first access (via `loadPosts`) and
 * cached afterwards, so the post modules are only ever imported once — and only
 * when actually needed. Drafts are included; callers decide whether to surface
 * them (see v4, which hides drafts in production and shows them in dev).
 */
let postsPromise: Promise<Record<string, PostEntry>> | undefined;

/**
 * Import every post module and validate its frontmatter against the schema,
 * resolving to the slug -> entry map. The `import.meta.glob` is declared inside
 * this function (not at module scope) and loaded lazily (no `eager`), so no post
 * module is imported until this is first called — each post becomes its own
 * on-demand chunk. Posts are globbed from the `@furtherland/contents` package via
 * the `@@contents` alias (Vite resolves aliases inside `import.meta.glob`
 * patterns). Matching v4 (Astro `glob` loader + zod schema), invalid frontmatter
 * throws rather than being silently skipped; we iterate by file path so the error
 * names the offending file, and a missing frontmatter block is treated as `{}`,
 * which also fails the schema (required fields absent). The home / post routes
 * call a getter while prerendering, so a bad frontmatter still fails the build.
 */
function loadPosts(): Promise<Record<string, PostEntry>> {
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
}

/** Look up a post by slug (imports the post modules on first call). */
export async function getPost(slug: string): Promise<PostEntry | undefined> {
  const posts = await loadPosts();
  return posts[slug];
}

/**
 * Posts for the home-page list, newest first. Drafts are only included outside
 * production, mirroring v4's `getCollection('posts', p => !p.isDraft || !PROD)`.
 */
export async function getPostSummaries(): Promise<PostEntry[]> {
  const posts = await loadPosts();
  const all = Object.values(posts);
  const visible = import.meta.env.PROD ? all.filter((post) => !post.isDraft) : all;
  return [...visible].sort((l, r) => (l.date === r.date ? 0 : l.date < r.date ? 1 : -1));
}
