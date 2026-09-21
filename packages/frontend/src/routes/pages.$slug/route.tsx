import { data } from 'react-router';

import { SITE_URL } from '@@frontend/constants/site';
import { getPage } from '@@frontend/content/pages.server';

import type { Route } from './+types/route';
import { RouteComponent as BaseRoute, type CreateContentPromiseFn, createMeta } from './common';

export const loader = async ({ params }: Route.LoaderArgs) => {
  const page = await getPage(params.slug);
  if (!page) {
    throw data('Not Found', { status: 404 });
  }
  return page;
};

export const meta = ({ loaderData }: Route.MetaArgs): Route.MetaDescriptors => {
  const url = `${SITE_URL}/pages/${loaderData.slug}`;
  return createMeta({ loaderData, url });
};

const createContentPromise: CreateContentPromiseFn = ({ slug }) =>
  import(`@@contents/pages/${slug}.mdx`);

const PageRoute = ({ loaderData }: Route.ComponentProps) => (
  <BaseRoute loaderData={loaderData} createContentPromise={createContentPromise} />
);

export default PageRoute;
