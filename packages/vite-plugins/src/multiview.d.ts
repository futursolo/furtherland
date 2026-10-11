/**
 * Modules imported with the `?multiview` query (see `MultiviewImagePlugin` in
 * this package) export a React component that renders a `<picture>` element
 * with a `<source>` per generated format (JXL, AVIF, WebP) and a JPEG
 * fallback `<img>`, plus a named string export per format URL.
 */
declare module '*?multiview' {
  import type { ComponentType, ElementType, ImgHTMLAttributes } from 'react';

  export interface MultiviewImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    /**
     * A component to render instead of the default `<img>` fallback element,
     * e.g. a styled component. It receives the same props as an `<img>`.
     */
    ImgComponent?: ElementType<ImgHTMLAttributes<HTMLImageElement>>;
  }

  const MultiviewImage: ComponentType<MultiviewImageProps>;

  export const jxl: string;
  export const avif: string;
  export const webp: string;
  export const jpg: string;

  export default MultiviewImage;
}
