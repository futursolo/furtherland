import { use, useMemo } from 'react';

import { MdxRenderer } from '@@frontend/components';
import type { PageEntry } from '@@frontend/content/pages.server';
import type { MdxModule } from '@@frontend/content/types';
import { notFoundMeta, pageMeta } from '@@frontend/utils/meta';

import Layout from './Layout';

interface CreateMetaOptions {
  loaderData?: PageEntry;
  url: string;
}

export const createMeta = (options: CreateMetaOptions) => {
  const { loaderData, url } = options;

  return loaderData ? pageMeta(loaderData, url) : notFoundMeta();
};

export type CreateContentPromiseFn = (options: { slug: string }) => Promise<MdxModule>;

interface RouteComponentProps {
  loaderData: PageEntry;
  createContentPromise: CreateContentPromiseFn;
}

export const RouteComponent = ({ loaderData, createContentPromise }: RouteComponentProps) => {
  const contentPromise = useMemo(
    () => createContentPromise({ slug: loaderData.slug }),
    [loaderData.slug, createContentPromise],
  );

  const { default: Component } = use(contentPromise);

  return (
    <Layout title={loaderData.title}>
      <MdxRenderer Content={Component} />
    </Layout>
  );
};
