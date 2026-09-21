import { use, useMemo } from 'react';

import { MdxRenderer } from '@@frontend/components';
import type { PageEntry } from '@@frontend/content/pages.server';
import type { MdxModule } from '@@frontend/content/types';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import Layout from './Layout';

interface CreateMetaOptions {
  loaderData?: PageEntry;
  url: string;
}

export const createMeta = (options: CreateMetaOptions) => {
  const { loaderData, url } = options;

  if (!loaderData) {
    return [
      ...baseMeta,
      { title: formatTitle('404 Not Found') },
      { name: 'robots', content: 'noindex' },
    ];
  }
  const page: PageEntry = loaderData;

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

interface CreateRouteComponentOptions {
  createContentPromise: (options: { slug: string }) => Promise<MdxModule>;
}

export const createRouteComponent = (options: CreateRouteComponentOptions) => {
  const { createContentPromise } = options;

  interface PageRouteProps {
    loaderData: PageEntry;
  }

  const PageRoute = ({ loaderData }: PageRouteProps) => {
    const contentPromise = useMemo(
      () => createContentPromise({ slug: loaderData.slug }),
      [loaderData.slug],
    );

    const { default: Component } = use(contentPromise);

    return (
      <Layout title={loaderData.title}>
        <MdxRenderer Content={Component} />
      </Layout>
    );
  };

  return PageRoute;
};
