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

// All posts, globbed from the @furtherland/contents package via the `@@contents`
// alias (Vite resolves aliases inside `import.meta.glob` patterns). Frontmatter is
// left out.
const mdxModules = import.meta.glob<MdxModule>(['@@contents/posts/**/*.mdx'], {
  eager: true,
});

// frontmatter is at mdxModules[key].frontmatter

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
