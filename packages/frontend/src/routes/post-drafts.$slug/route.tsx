import { data } from 'react-router';

import { SITE_URL } from '@@frontend/constants/site';
import { getDraftPost } from '@@frontend/content/posts.server';

import { RouteComponent as BaseRoute, createMeta } from '../posts.$slug/common';
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
  const url = `${SITE_URL}/post-drafts/${loaderData.slug}`;
  const commonMeta = createMeta({ loaderData, url });

  return [...commonMeta, { name: 'robots', content: 'noindex' }];
};

const PostDraftRoute = ({ loaderData }: Route.ComponentProps) => (
  <BaseRoute
    loaderData={loaderData}
    createContentPromise={({ date, slug }) => import(`@@contents/post-drafts/${date}/${slug}.mdx`)}
  />
);

export default PostDraftRoute;
