import { use, useMemo } from 'react';

import { MdxRenderer } from '@@frontend/components';
import type { PostEntry } from '@@frontend/content/posts.server';
import type { MdxModule } from '@@frontend/content/types';
import { notFoundMeta, postMeta } from '@@frontend/utils/meta';

import Layout from './Layout';

interface CreateMetaOptions {
  loaderData?: PostEntry;
  url: string;
}

export const createMeta = (options: CreateMetaOptions) => {
  const { loaderData, url } = options;

  return loaderData ? postMeta(loaderData, url) : notFoundMeta();
};

export type CreateContentPromiseFn = (options: {
  slug: string;
  date: string;
}) => Promise<MdxModule>;

interface RouteComponentProps {
  loaderData: PostEntry;
  createContentPromise: CreateContentPromiseFn;
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
