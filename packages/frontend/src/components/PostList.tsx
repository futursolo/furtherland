import Author from '@@frontend/components/Author';
import Box from '@@frontend/components/Box';
import Link from '@@frontend/components/Link';
import Main, { MainContainer } from '@@frontend/components/Main';
import type { PostEntry } from '@@frontend/content/posts.server';
import { H2 } from '@@frontend/elements';
import { styled } from '@@frontend/utils';

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
      <Link to={isDraft ? `/post-drafts/${slug}` : `/posts/${slug}`}>
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

  return (
    <Main style={{ minHeight: 'calc(100vh - 160px)' }}>
      <MainContainer>
        <PostListLayout>{items}</PostListLayout>
      </MainContainer>
    </Main>
  );
};

export default PostList;
