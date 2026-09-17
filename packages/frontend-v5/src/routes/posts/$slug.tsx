import { Suspense, use } from 'react';

import { createFileRoute, notFound } from '@tanstack/react-router';

import Main, { MainContainer } from '@@frontend-v5/components/Main';
import { AUTHOR_NAME, SITE_URL } from '@@frontend-v5/constants/site';
import { getPost, type PostEntry } from '@@frontend-v5/content/posts';
import { mdxComponents } from '@@frontend-v5/elements';
import Post from '@@frontend-v5/layouts/Post';
import formatTitle from '@@frontend-v5/utils/formatTitle';

// Blog post — the v5 equivalent of v4's `pages/posts/[slug].astro`. v4 used
// `getStaticPaths` to expand one route per post; here the `$slug` param is
// resolved against the build-time `posts` map in the loader, and unknown /
// production-draft posts throw `notFound()` (rendered by the root's
// `notFoundComponent`, with a 404 status). The post is wrapped in the v5 Post
// layout.
export const Route = createFileRoute('/posts/$slug')({
  head: async ({ params }) => {
    const post = await getPost(params.slug);
    if (!post) return {};
    const url = `${SITE_URL}/posts/${post.slug}`;
    return {
      meta: [
        { title: formatTitle(post.title) },
        ...(post.description ? [{ name: 'description', content: post.description }] : []),
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: formatTitle(post.title) },
        ...(post.description ? [{ property: 'og:description', content: post.description }] : []),
        { property: 'og:url', content: url },
        { property: 'article:published_time', content: new Date(post.date).toISOString() },
        { property: 'article:author', content: AUTHOR_NAME },
      ],
      links: [{ rel: 'canonical', href: url }],
    };
  },
  loader: async ({ params }) => {
    const post = await getPost(params.slug);
    if (!post || (post.isDraft && import.meta.env.PROD)) throw notFound();
    return { slug: post.slug, date: post.date, isDraft: post.isDraft, title: post.title };
  },
  component: PostPage,
});

// Renders the post's MDX body. The `use()` call suspends this component while
// the post's MDX chunk is fetched; the `<Suspense>` boundary in `PostPage`
// (below) scopes that suspension, so an empty `<Main>`/`<MainContainer>` is shown
// in place of the layout while the content loads.
function PostContent(props: { date: string; slug: string }) {
  const { default: Content } = use(import(`@@contents/posts/${props.date}/${props.slug}.mdx`));
  return <Content components={mdxComponents} />;
}

function PostPage() {
  const postData: PostEntry = Route.useLoaderData();

  return (
    <Suspense
      fallback={
        <Main>
          <MainContainer />
        </Main>
      }
    >
      <Post
        slug={postData.slug}
        date={postData.date}
        title={postData.title}
        isDraft={postData.isDraft}
      >
        <PostContent date={postData.date} slug={postData.slug} />
      </Post>
    </Suspense>
  );
}
