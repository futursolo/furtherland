import { use, useMemo } from 'react';

import { MdxRenderer } from '@@frontend/components';
import { AUTHOR_NAME } from '@@frontend/constants/site';
import type { PostEntry } from '@@frontend/content/posts.server';
import type { MdxModule } from '@@frontend/content/types';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import Layout from './Layout';

interface CreateMetaOptions {
  loaderData?: PostEntry;
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

  return [
    ...baseMeta,
    { title: formatTitle(loaderData.title) },
    ...(loaderData.description ? [{ name: 'description', content: loaderData.description }] : []),
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: formatTitle(loaderData.title) },
    ...(loaderData.description
      ? [{ property: 'og:description', content: loaderData.description }]
      : []),
    { property: 'og:url', content: url },
    { property: 'article:published_time', content: new Date(loaderData.date).toISOString() },
    { property: 'article:author', content: AUTHOR_NAME },
    { tagName: 'link', rel: 'canonical', href: url },
  ];
};

interface RouteComponentProps {
  loaderData: PostEntry;
  createContentPromise: (options: { slug: string; date: string }) => Promise<MdxModule>;
}

export const RouteComponent = ({ loaderData, createContentPromise }: RouteComponentProps) => {
  const contentPromise = useMemo(
    () => createContentPromise({ slug: loaderData.slug, date: loaderData.date }),
    [loaderData.slug, loaderData.date, createContentPromise],
  );

  const { default: Component } = use(contentPromise);

  return (
    <Layout
      slug={loaderData.slug}
      date={loaderData.date}
      title={loaderData.title}
      isDraft={loaderData.isDraft}
    >
      <MdxRenderer Content={Component} />
    </Layout>
  );
};
