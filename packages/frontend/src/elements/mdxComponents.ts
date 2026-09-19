import ClientOnly from '@@frontend/components/ClientOnly';
import LazyOnly from '@@frontend/components/LazyOnly';
import Render from '@@frontend/components/Render';

import Anchor from './Anchor';
import Code from './Code';
import H1 from './H1';
import H2 from './H2';
import H3 from './H3';
import Paragraph from './Paragraph';
import Pre from './Pre';
import Table from './Table';

// Shared MDX element overrides, passed to the compiled MDX component via
// `components`. `ClientOnly`/`LazyOnly` back the rewritten Astro
// `client:only`/`client:visible` directives (see `vite.config.ts`). Used by
// both the posts and pages routes so both keep identical overrides (e.g. wide
// tables get a horizontal-scroll wrapper).
export const mdxComponents = {
  a: Anchor,
  code: Code,
  h1: H1,
  h2: H2,
  h3: H3,
  p: Paragraph,
  pre: Pre,
  table: Table,
  ClientOnly,
  LazyOnly,
  Render,
};
