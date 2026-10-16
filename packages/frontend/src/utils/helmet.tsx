import type { ReactNode } from 'react';

import type { MetaTag } from './meta';

/**
 * Render a list of meta tag descriptors as react-helmet tags.
 */
const metaToTags = (descriptors: MetaTag[]): ReactNode[] =>
  descriptors.flatMap((descriptor) => {
    if (typeof descriptor !== 'object' || descriptor === null) return [];

    const tag = descriptor as Record<string, unknown>;

    if (tag.tagName === 'link') {
      return [
        <link
          key={`link-${tag.rel}-${tag.href}`}
          rel={tag.rel as string}
          href={tag.href as string}
        />,
      ];
    }

    if (typeof tag.title === 'string') {
      return [<title key="title">{tag.title}</title>];
    }

    const { charSet, name, property, httpEquiv } = tag;

    return [
      <meta
        key={`meta-${name ?? property ?? httpEquiv ?? charSet ?? ''}`}
        charSet={charSet as string | undefined}
        name={name as string | undefined}
        property={property as string | undefined}
        httpEquiv={httpEquiv as string | undefined}
        content={tag.content as string | undefined}
      />,
    ];
  });

export default metaToTags;
