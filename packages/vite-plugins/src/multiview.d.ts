/**
 * Modules imported with the `?multiview` query (see `multiviewImagePlugin` in
 * this package) export a React component that renders a `<picture>` element
 * with a `<source>` per generated format (JXL, AVIF, WebP) and a fallback
 * `<img>` — JPEG for opaque sources, PNG for sources with an alpha channel —
 * plus a named string export per variant URL and for the fallback URL.
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
  /**
   * The URL of the fallback `<img>`: a JPEG for opaque sources, a lossless
   * PNG for sources with an alpha channel.
   */
  export const fallback: string;

  export default MultiviewImage;
}
