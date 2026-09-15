import type { ComponentType } from 'react';

/**
 * Default export of a compiled `.mdx` file: a React component that renders the
 * markdown body. Frontmatter is intentionally omitted (not parsed or exposed).
 */
export type MdxComponent = ComponentType<{
  components?: Record<string, unknown>;
}>;

type MdxModule = {
  default: MdxComponent;
};

// All posts, with the `2099-12-31/` folder (the draft sentinel) negated so
// drafts are never imported into the build. The negation is a plain `!` pattern —
// not an extglob — so Vite's `import.meta.glob` handles it. Frontmatter is left out.
const mdxModules = import.meta.glob<MdxModule>(
  ['../../../../contents/posts/**/*.mdx', '!../../../../contents/posts/2099-12-31/**'],
  { eager: true },
);

/** Map of slug -> compiled MDX component for every non-draft post. */
export const posts: Record<string, MdxComponent> = {};

for (const [key, mod] of Object.entries(mdxModules)) {
  const file = key.split('/').at(-1);
  if (!file) continue;

  posts[file.replace(/\.mdx$/, '')] = mod.default;
}

/** Look up a post component by slug. */
export function getPost(slug: string): MdxComponent | undefined {
  return posts[slug];
}
