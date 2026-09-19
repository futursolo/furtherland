declare module '*.mdx' {
  import type { MdxModule } from '@@frontend/content/types';

  const content: MdxModule['default'];
  export default content;

  export const frontmatter: MdxModule['frontmatter'];
}
