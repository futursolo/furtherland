import Anchor from './Anchor';
import H3 from './H3';
import Paragraph from './Paragraph';
import Pre from './Pre';
import Table from './Table';

// Shared MDX element overrides, passed to the compiled MDX component via
// `components`. The v5 counterparts of v4's `Mdx/Anchor.astro`,
// `Mdx/Pre.astro`, `Mdx/H3.astro`, `Mdx/Paragraph.astro` and
// `Mdx/Table.astro`. Used by both the posts and pages routes so both keep
// identical overrides (e.g. wide tables get a horizontal-scroll wrapper).
export const mdxComponents = { a: Anchor, h3: H3, p: Paragraph, pre: Pre, table: Table };
