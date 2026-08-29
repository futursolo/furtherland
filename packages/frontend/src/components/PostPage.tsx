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

const PostPage = (props: PropsWithChildren<PostPageProps>) => {
  const { children, date, title, isDraft } = props;

  return (
    <ThemeProvider>
      <Main>
        <MainContainer>
          <H1>{title}</H1>
          <Author date={date} isDraft={isDraft} />
          <Content>{children}</Content>
        </MainContainer>
      </Main>
    </ThemeProvider>
  );
};

export default PostPage;
