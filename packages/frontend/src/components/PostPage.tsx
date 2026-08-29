import { type PropsWithChildren, useEffect, useRef } from 'react';

import { useStore } from '@nanostores/react';

import themeAtom from '@@frontend/atoms/theme';
import { Author, H1, Main, MainContainer } from '@@frontend/components';
import ClientOnly from '@@frontend/components/ClientOnly';
import ThemeProvider from '@@frontend/providers/theme';
import { styled } from '@@frontend/utils';

interface PostPageProps {
  slug: string;
  date: string;
  title: string;
  isDraft: boolean;
}

const Content = styled('article')({
  boxSizing: 'border-box',
  width: '100%',
});

const Comments = styled('section')({
  boxSizing: 'border-box',
  width: '100%',
  marginTop: '3rem',
});

const giscusTheme = {
  light: 'light',
  dark: 'dark',
} as const;

const GiscusComments = ({ slug }: { slug: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeKind = useStore(themeAtom);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl || containerEl.childElementCount > 0) {
      return;
    }

    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://giscus.app/client.js';
    scriptEl.async = true;
    scriptEl.crossOrigin = 'anonymous';
    scriptEl.setAttribute('data-repo', 'futursolo/furtherland');
    scriptEl.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkzMzExMDIzOQ==');
    scriptEl.setAttribute('data-category', 'Post Comments');
    scriptEl.setAttribute('data-category-id', 'DIC_kwDOAfk4384DEdL-');
    scriptEl.setAttribute('data-mapping', 'specific');
    scriptEl.setAttribute('data-term', `slug:${slug}`);
    scriptEl.setAttribute('data-strict', '1');
    scriptEl.setAttribute('data-reactions-enabled', '1');
    scriptEl.setAttribute('data-emit-metadata', '0');
    scriptEl.setAttribute('data-input-position', 'top');
    scriptEl.setAttribute('data-theme', giscusTheme[themeKind]);
    scriptEl.setAttribute('data-lang', 'en');

    containerEl.append(scriptEl);
  }, [slug, themeKind]);

  useEffect(() => {
    const iframeEl = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
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

  return <div ref={containerRef} />;
};

const PostPage = (props: PropsWithChildren<PostPageProps>) => {
  const { children, slug, date, title, isDraft } = props;

  return (
    <ThemeProvider>
      <Main>
        <MainContainer>
          <H1>{title}</H1>
          <Author date={date} isDraft={isDraft} />
          <Content>{children}</Content>
          <Comments>
            <ClientOnly>
              <GiscusComments slug={slug} />
            </ClientOnly>
          </Comments>
        </MainContainer>
      </Main>
    </ThemeProvider>
  );
};

export default PostPage;
