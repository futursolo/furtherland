import { data } from 'react-router';

import { SITE_URL } from '@@frontend/constants/site';
import { getDraftPage } from '@@frontend/content/pages.server';

import {
  RouteComponent as BaseRoute,
  type CreateContentPromiseFn,
  createMeta,
} from '../pages.$slug/common';
import type { Route } from './+types/route';

export const loader = async ({ params }: Route.LoaderArgs) => {
  if (import.meta.env.PROD) {
    throw data('Not Found', { status: 404 });
  }
  const page = await getDraftPage(params.slug);
  if (!page) {
    throw data('Not Found', { status: 404 });
  }
  return page;
};

export const meta = ({ loaderData }: Route.MetaArgs): Route.MetaDescriptors => {
  const url = `${SITE_URL}/page-drafts/${loaderData.slug}`;
  const commonMeta = createMeta({ loaderData, url });

  return [...commonMeta, { name: 'robots', content: 'noindex' }];
};

const createContentPromise: CreateContentPromiseFn = ({ slug }) =>
  import(`@@contents/page-drafts/${slug}.mdx`);

const PageDraftRoute = ({ loaderData }: Route.ComponentProps) => (
  <BaseRoute loaderData={loaderData} createContentPromise={createContentPromise} />
);

export default PageDraftRoute;
