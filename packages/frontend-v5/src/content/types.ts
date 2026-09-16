import type { ComponentType } from 'react';

/**
 * Default export of a compiled `.mdx` file: a React component that renders the
 * markdown body. It accepts a `components` map to override intrinsic elements —
 * the v5 replacement for v4's `render(entry)` + `components={...}` on Astro MDX.
 */
export type MdxComponent = ComponentType<{
  components?: Record<string, unknown>;
}>;

/**
 * Shape of a module produced by `@mdx-js/rollup` for a `.mdx` file: the rendered
 * component (`default`) plus the parsed frontmatter (exposed as a named
 * `frontmatter` export by `remark-frontmatter` / `remark-mdx-frontmatter`).
 */
export type MdxModule = {
  default: MdxComponent;
  frontmatter?: Record<string, unknown>;
};
