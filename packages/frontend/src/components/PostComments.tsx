import { useEffect, useRef } from 'react';

import { useStore } from '@nanostores/react';

import themeAtom from '@@frontend/atoms/theme';
import ClientOnly from '@@frontend/components/ClientOnly';
import { styled } from '@@frontend/utils';

interface PostCommentsProps {
  slug: string;
}

const Comments = styled('section')({
  boxSizing: 'border-box',
  width: '100%',
  marginTop: '3rem',
});

const giscusTheme = {
  light: 'light',
  dark: 'dark',
} as const;

const GiscusComments = ({ slug }: PostCommentsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeKind = useStore(themeAtom);

  useEffect(() => {
    const containerEl = containerRef.current;
    const iframeEl = containerEl?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    iframeEl?.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            theme: giscusTheme[themeKind],
          },
        },
      },
      'https://giscus.app',
    );
  }, [themeKind]);

  return (
    <div ref={containerRef}>
      <script
        src="https://giscus.app/client.js"
        async
        crossOrigin="anonymous"
        data-repo="futursolo/furtherland"
        data-repo-id="MDEwOlJlcG9zaXRvcnkzMzExMDIzOQ=="
        data-category="Post Comments"
        data-category-id="DIC_kwDOAfk4384DEdL-"
        data-mapping="specific"
        data-term={`slug:${slug}`}
        data-strict="1"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme={giscusTheme[themeKind]}
        data-lang="en"
      />
    </div>
  );
};

const PostComments = ({ slug }: PostCommentsProps) => {
  return (
    <Comments>
      <ClientOnly>
        <GiscusComments slug={slug} />
      </ClientOnly>
    </Comments>
  );
};

export default PostComments;
