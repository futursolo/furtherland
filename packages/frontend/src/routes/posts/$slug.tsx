import { useMemo } from 'react';

import { Await, createFileRoute, notFound } from '@tanstack/react-router';

import { ContentSkeleton } from '@@frontend/components';
import { AUTHOR_NAME, SITE_URL } from '@@frontend/constants/site';
import { getPost, type PostEntry } from '@@frontend/content/posts';
import type { MdxModule } from '@@frontend/content/types';
import { mdxComponents } from '@@frontend/elements';
import Post from '@@frontend/layouts/Post';
import formatTitle from '@@frontend/utils/formatTitle';

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

    return post;
  },
  component: PostPage,
});

function PostPage() {
  const postData: PostEntry = Route.useLoaderData();

  const contentPromise = useMemo(
    () => import(`@@contents/posts/${postData.date}/${postData.slug}.mdx`) as Promise<MdxModule>,
    [postData.date, postData.slug],
  );

  return (
    <Post
      slug={postData.slug}
      date={postData.date}
      title={postData.title}
      isDraft={postData.isDraft}
    >
      <Await promise={contentPromise} fallback={<ContentSkeleton />}>
        {({ default: Component }) => <Component components={mdxComponents} />}
      </Await>
    </Post>
  );
}
