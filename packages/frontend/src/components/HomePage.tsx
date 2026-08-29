import { Author, Box, H2, Link, Main, MainContainer } from '@@frontend/components';
import Theme from '@@frontend/providers/theme';
import { styled } from '@@frontend/utils';

import type { CollectionEntry } from 'astro:content';

interface PostSummaryProps {
  date: string;
  slug: string;
  title: string;
  isDraft: boolean;
}

const PostContainer = styled(Box)({
  width: '100%',
});

const PostSummary = (props: PostSummaryProps) => {
  const { date, slug, title, isDraft } = props;
  return (
    <PostContainer>
      <Link href={`/posts/${slug}`}>
        <H2>{title}</H2>
      </Link>
      <Author date={date} isDraft={isDraft} />
    </PostContainer>
  );
};

interface PostListProps {
  summaries: CollectionEntry<'posts'>[];
}

const PostListLayout = styled(Box)({
  width: '100%',
});

const PostList = (props: PostListProps) => {
  const { summaries } = props;
  const posts = summaries.map((entry) => {
    const { date, slug, title, isDraft } = entry.data;
    return <PostSummary key={slug} slug={slug} date={date} title={title} isDraft={isDraft} />;
  });

  return <PostListLayout>{posts}</PostListLayout>;
};
interface HomePageProps {
  summaries: CollectionEntry<'posts'>[];
}

const HomePage = (props: HomePageProps) => {
  const { summaries } = props;

  return (
    <Theme>
      <Main style={{ minHeight: 'calc(100vh - 160px)' }}>
        <MainContainer>
          <PostList summaries={summaries} />
        </MainContainer>
      </Main>
    </Theme>
  );
};

export default HomePage;
