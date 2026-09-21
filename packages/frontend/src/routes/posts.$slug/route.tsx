import { data } from 'react-router';

import { SITE_URL } from '@@frontend/constants/site';
import { getPost } from '@@frontend/content/posts.server';

import type { Route } from './+types/route';
import { createMeta, createRouteComponent } from './common';

export const loader = async ({ params }: Route.LoaderArgs) => {
  const post = await getPost(params.slug);
  if (!post) {
    throw data('Not Found', { status: 404 });
  }
  return post;
};

export const meta = ({ loaderData }: Route.MetaArgs): Route.MetaDescriptors => {
  const url = `${SITE_URL}/posts/${loaderData.slug}`;

  return createMeta({ loaderData, url });
};

const PostRoute = createRouteComponent({
  createContentPromise: ({ date, slug }) => import(`@@contents/posts/${date}/${slug}.mdx`),
});

export default PostRoute;
