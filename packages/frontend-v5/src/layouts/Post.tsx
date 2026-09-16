import type { PropsWithChildren } from 'react';

import { Author, LazyOnly, Main, MainContainer } from '@@frontend-v5/components';
// Imported directly (not via the barrel) so the Giscus dependency only lands in
// the post page's bundle, not every page that imports the components barrel.
import PostComments from '@@frontend-v5/components/PostComments';
import { H1 } from '@@frontend-v5/elements';
import { styled } from '@@frontend-v5/utils';

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
  const { children, slug, date, title, isDraft } = props;

  return (
    <Main>
      <MainContainer>
        <H1>{title}</H1>
        <Author date={date} isDraft={isDraft} />
        <Content>{children}</Content>
        <LazyOnly>
          <PostComments slug={slug} />
        </LazyOnly>
      </MainContainer>
    </Main>
  );
};

export default PostPage;
