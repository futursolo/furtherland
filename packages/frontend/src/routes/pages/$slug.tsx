import { useMemo } from 'react';

import { Await, createFileRoute, notFound } from '@tanstack/react-router';

import { ContentSkeleton } from '@@frontend/components';
import { SITE_URL } from '@@frontend/constants/site';
import { getPage, type PageEntry } from '@@frontend/content/pages';
import type { MdxModule } from '@@frontend/content/types';
import { mdxComponents } from '@@frontend/elements';
import Page from '@@frontend/layouts/Page';
import formatTitle from '@@frontend/utils/formatTitle';

export const Route = createFileRoute('/pages/$slug')({
  head: async ({ params }) => {
    const page = await getPage(params.slug);
    if (!page) return {};
    const url = `${SITE_URL}/pages/${page.slug}`;
    return {
      meta: [
        { title: formatTitle(page.title) },
        ...(page.description ? [{ name: 'description', content: page.description }] : []),
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: formatTitle(page.title) },
        ...(page.description ? [{ property: 'og:description', content: page.description }] : []),
        { property: 'og:url', content: url },
      ],
      links: [{ rel: 'canonical', href: url }],
    };
  },
  loader: async ({ params }) => {
    const page = await getPage(params.slug);
    if (!page || (page.isDraft && import.meta.env.PROD)) throw notFound();

    return page;
  },
  component: PageRoute,
});

function PageRoute() {
  const pageData: PageEntry = Route.useLoaderData();

  const contentPromise = useMemo(
    () => import(`@@contents/pages/${pageData.slug}.mdx`) as Promise<MdxModule>,
    [pageData.slug],
  );

  return (
    <Page title={pageData.title}>
      <Await promise={contentPromise} fallback={<ContentSkeleton />}>
        {({ default: Component }) => <Component components={mdxComponents} />}
      </Await>
    </Page>
  );
}
