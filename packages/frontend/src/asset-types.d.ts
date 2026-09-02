import type { MDXContent } from 'mdx/types';

declare module '*.mdx' {
  const value: MDXContent;
  export default value;
}

// declare module '*.png' {
//   const value: string;
//   export = value;
// }

// declare module '*.jpg' {
//   const value: string;
//   export = value;
// }

// declare module '*.webp' {
//   const value: string;
//   export = value;
// }

// declare module '*.avif' {
//   const value: string;
//   export = value;
// }

declare global {
  declare module '*.jxl' {
    const value: string;
    export default value;
  }
}
