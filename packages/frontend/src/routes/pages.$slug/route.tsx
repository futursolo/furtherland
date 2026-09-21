import { use, useMemo } from 'react';

import { data, useLoaderData } from 'react-router';

import { MdxRenderer } from '@@frontend/components';
import { SITE_URL } from '@@frontend/constants/site';
import { getPage, type PageEntry } from '@@frontend/content/pages.server';
import type { MdxModule } from '@@frontend/content/types';
import Page from '@@frontend/layouts/Page';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import type { Route } from './+types/route';

export const loader = async ({ params }: Route.LoaderArgs) => {
  const page = await getPage(params.slug);
  if (!page) {
    throw data('Not Found', { status: 404 });
  }
  return page;
};

export const meta = ({ loaderData }: Route.MetaArgs): Route.MetaDescriptors => {
  if (!loaderData) {
    return [
      ...baseMeta,
      { title: formatTitle('404 Not Found') },
      { name: 'robots', content: 'noindex' },
    ];
  }
  const page: PageEntry = loaderData;
  const url = `${SITE_URL}/pages/${page.slug}`;

  return [
    ...baseMeta,
    { title: formatTitle(page.title) },
    ...(page.description ? [{ name: 'description', content: page.description }] : []),
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: formatTitle(page.title) },
    ...(page.description ? [{ property: 'og:description', content: page.description }] : []),
    { property: 'og:url', content: url },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

const PageRoute = () => {
  const pageData: PageEntry = useLoaderData<typeof loader>();

  const contentPromise = useMemo(
    () => import(`@@contents/pages/${pageData.slug}.mdx`) as Promise<MdxModule>,
    [pageData.slug],
  );

  const { default: Component } = use(contentPromise);

  return (
    <Page title={pageData.title}>
      <MdxRenderer Content={Component} />
    </Page>
  );
};

export default PageRoute;
