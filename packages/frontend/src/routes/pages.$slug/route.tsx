import { Suspense, useMemo } from 'react';

import { Await, useLoaderData } from 'react-router';

import { ContentSkeleton } from '@@frontend/components';
import { SITE_URL } from '@@frontend/constants/site';
import { getPage, type PageEntry } from '@@frontend/content/pages';
import type { MdxModule } from '@@frontend/content/types';
import { mdxComponents } from '@@frontend/elements';
import Page from '@@frontend/layouts/Page';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import type { Route } from './+types/route';

export async function loader({ params }: Route.LoaderArgs) {
  const page = await getPage(params.slug);
  if (!page || (page.isDraft && import.meta.env.PROD)) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }
  return page;
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
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
}

export default function PageRoute() {
  const pageData: PageEntry = useLoaderData<typeof loader>();

  const contentPromise = useMemo(
    () => import(`@@contents/pages/${pageData.slug}.mdx`) as Promise<MdxModule>,
    [pageData.slug],
  );

  return (
    <Page title={pageData.title}>
      <Suspense fallback={<ContentSkeleton />}>
        <Await resolve={contentPromise}>
          {({ default: Component }) => <Component components={mdxComponents} />}
        </Await>
      </Suspense>
    </Page>
  );
}
