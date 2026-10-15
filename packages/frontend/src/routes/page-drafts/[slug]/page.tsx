import { Helmet } from '@modern-js/runtime/head';
import { useLoaderData } from '@modern-js/runtime/router';

import { SITE_URL } from '@@frontend/constants/site';
import type { PageEntry } from '@@frontend/content/pages.server';
import metaToTags from '@@frontend/utils/helmet';

import { type CreateContentPromiseFn, createMeta, RouteComponent } from '../../pages/[slug]/common';

const createContentPromise: CreateContentPromiseFn = ({ slug }) =>
  import(`@@contents/page-drafts/${slug}.mdx`);

const PageDraftRoute = () => {
  const page = useLoaderData<PageEntry>();
  const url = `${SITE_URL}/page-drafts/${page.slug}`;

  return (
    <>
      <Helmet>
        {metaToTags([
          ...createMeta({ loaderData: page, url }),
          { name: 'robots', content: 'noindex' },
        ])}
      </Helmet>
      <RouteComponent loaderData={page} createContentPromise={createContentPromise} />
    </>
  );
};

export default PageDraftRoute;
