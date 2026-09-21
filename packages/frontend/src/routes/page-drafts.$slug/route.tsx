import { use, useMemo } from 'react';

import { data, useLoaderData } from 'react-router';

import MdxRenderer from '@@frontend/components/MDXRenderer';
import { SITE_URL } from '@@frontend/constants/site';
import { getDraftPage, type PageEntry } from '@@frontend/content/pages.server';
import type { MdxModule } from '@@frontend/content/types';
import Page from '@@frontend/layouts/Page';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

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
  if (!loaderData) {
    return [
      ...baseMeta,
      { title: formatTitle('404 Not Found') },
      { name: 'robots', content: 'noindex' },
    ];
  }
  const page: PageEntry = loaderData;
  const url = `${SITE_URL}/page-drafts/${page.slug}`;

  return [
    ...baseMeta,
    { title: formatTitle(page.title) },
    ...(page.description ? [{ name: 'description', content: page.description }] : []),
    { name: 'robots', content: 'noindex' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: formatTitle(page.title) },
    ...(page.description ? [{ property: 'og:description', content: page.description }] : []),
    { property: 'og:url', content: url },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

const PageDraftRoute = () => {
  const pageData: PageEntry = useLoaderData<typeof loader>();

  const contentPromise = useMemo(
    () => import(`@@contents/page-drafts/${pageData.slug}.mdx`) as Promise<MdxModule>,
    [pageData.slug],
  );

  const { default: Component } = use(contentPromise);

  return (
    <Page title={pageData.title}>
      <MdxRenderer Content={Component} />
    </Page>
  );
};

export default PageDraftRoute;
