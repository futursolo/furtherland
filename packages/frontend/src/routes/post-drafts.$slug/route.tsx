import { use, useMemo } from 'react';

import { data, useLoaderData } from 'react-router';

import { AUTHOR_NAME, SITE_URL } from '@@frontend/constants/site';
import { getDraftPost, type PostEntry } from '@@frontend/content/posts.server';
import type { MdxModule } from '@@frontend/content/types';
import { mdxComponents } from '@@frontend/elements';
import Post from '@@frontend/layouts/Post';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import type { Route } from './+types/route';

export const loader = async ({ params }: Route.LoaderArgs) => {
  if (import.meta.env.PROD) {
    throw data('Not Found', { status: 404 });
  }
  const post = await getDraftPost(params.slug);
  if (!post) {
    throw data('Not Found', { status: 404 });
  }
  return post;
};

export const meta = ({ loaderData }: Route.MetaArgs): Route.MetaDescriptors => {
  if (!loaderData) {
    return [
      ...baseMeta,
      { title: formatTitle('404 Not Found') },
      { name: 'robots', content: 'noindex' },
    ];
  }
  const post: PostEntry = loaderData;
  const url = `${SITE_URL}/post-drafts/${post.slug}`;

  return [
    ...baseMeta,
    { title: formatTitle(post.title) },
    ...(post.description ? [{ name: 'description', content: post.description }] : []),
    { name: 'robots', content: 'noindex' },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: formatTitle(post.title) },
    ...(post.description ? [{ property: 'og:description', content: post.description }] : []),
    { property: 'og:url', content: url },
    { property: 'article:published_time', content: new Date(post.date).toISOString() },
    { property: 'article:author', content: AUTHOR_NAME },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

const PostDraftPage = () => {
  const postData: PostEntry = useLoaderData<typeof loader>();

  const contentPromise = useMemo(() => {
    // Special code for tree shaking.
    if (!import.meta.env.PROD) {
      return import(
        `@@contents/post-drafts/${postData.date}/${postData.slug}.mdx`
      ) as Promise<MdxModule>;
    }
    throw new Error('Impossible under production!');
  }, [postData.date, postData.slug]);

  const { default: Component } = use(contentPromise);

  return (
    <Post
      slug={postData.slug}
      date={postData.date}
      title={postData.title}
      isDraft={postData.isDraft}
    >
      <Component components={mdxComponents} />
    </Post>
  );
};

export default PostDraftPage;
