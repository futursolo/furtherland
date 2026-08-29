import type { PropsWithChildren } from 'react';

import { Author, H1, Main, MainContainer } from '@@frontend/components';
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
            <script
              src="https://giscus.app/client.js"
              data-repo="futursolo/furtherland"
              data-repo-id="MDEwOlJlcG9zaXRvcnkzMzExMDIzOQ=="
              data-category="General"
              data-category-id="DIC_kwDOAfk4384DEcq6"
              data-mapping="specific"
              data-term={`slug:${slug}`}
              data-strict="1"
              data-reactions-enabled="1"
              data-emit-metadata="0"
              data-input-position="top"
              data-theme="preferred_color_scheme"
              data-lang="en"
              crossOrigin="anonymous"
              async
            />
          </Comments>
        </MainContainer>
      </Main>
    </ThemeProvider>
  );
};

export default PostPage;
