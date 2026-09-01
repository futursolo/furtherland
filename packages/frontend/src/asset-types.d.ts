import type { MDXContent } from 'mdx/types';

declare module '*.mdx' {
  const value: MDXContent;
  export default value;
}

declare global {
  declare module '*.jpg' {
    const value: import('astro').ImageMetadata;
    export default value;
  }

  declare module '*.webp' {
    const value: import('astro').ImageMetadata;
    export default value;
  }

  declare module '*.avif' {
    const value: import('astro').ImageMetadata;
    export default value;
  }

  declare module '*.jxl' {
    const value: string;
    export default value;
  }
}
