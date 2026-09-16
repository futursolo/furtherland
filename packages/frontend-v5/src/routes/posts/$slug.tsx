import { createFileRoute, notFound } from '@tanstack/react-router';

import { AUTHOR_NAME, SITE_URL } from '@@frontend-v5/constants/site';
import { getPost, type PostEntry } from '@@frontend-v5/content/posts';
import { Anchor, Pre, Table } from '@@frontend-v5/elements';
import Post from '@@frontend-v5/layouts/Post';
import formatTitle from '@@frontend-v5/utils/formatTitle';

// MDX element overrides — the v5 counterparts of v4's `Mdx/Anchor.astro`,
// `Mdx/Pre.astro` and `Mdx/Table.astro`, passed to the compiled MDX component.
const mdxComponents = { a: Anchor, pre: Pre, table: Table };

// Blog post — the v5 equivalent of v4's `pages/posts/[slug].astro`. v4 used
// `getStaticPaths` to expand one route per post; here the `$slug` param is
// resolved against the build-time `posts` map in the loader, and unknown /
// production-draft posts throw `notFound()` (rendered by the root's
// `notFoundComponent`, with a 404 status). The post is wrapped in the v5 Post
// layout.
export const Route = createFileRoute('/posts/$slug')({
  head: ({ params }) => {
    const post = getPost(params.slug);
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
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post || (post.isDraft && import.meta.env.PROD)) throw notFound();
    return post;
  },
  component: PostPage,
});

function PostPage() {
  const post: PostEntry = Route.useLoaderData();

  return (
    <Post slug={post.slug} date={post.date} title={post.title} isDraft={post.isDraft}>
      <post.Content components={mdxComponents} />
    </Post>
  );
}
