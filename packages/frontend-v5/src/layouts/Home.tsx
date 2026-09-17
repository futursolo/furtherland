import { Author, Box, Link, Main, MainContainer } from '@@frontend-v5/components';
import type { PostEntry } from '@@frontend-v5/content/posts';
import { H2 } from '@@frontend-v5/elements';
import { styled } from '@@frontend-v5/utils';

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
      <Link to={`/posts/${slug}`}>
        <H2>{title}</H2>
      </Link>
      <Author date={date} isDraft={isDraft} />
    </PostContainer>
  );
};

interface PostListProps {
  summaries: Omit<PostEntry, 'Content'>[];
}

const PostListLayout = styled(Box)({
  width: '100%',
});

const PostList = (props: PostListProps) => {
  const { summaries } = props;
  const items = summaries.map((post) => (
    <PostSummary
      key={post.slug}
      slug={post.slug}
      date={post.date}
      title={post.title}
      isDraft={post.isDraft}
    />
  ));

  return <PostListLayout>{items}</PostListLayout>;
};

interface HomePageProps {
  summaries: Omit<PostEntry, 'Content'>[];
}

const HomePage = (props: HomePageProps) => {
  const { summaries } = props;

  return (
    <Main style={{ minHeight: 'calc(100vh - 160px)' }}>
      <MainContainer>
        <PostList summaries={summaries} />
      </MainContainer>
    </Main>
  );
};

export default HomePage;
