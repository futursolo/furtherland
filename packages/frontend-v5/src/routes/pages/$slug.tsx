import { Suspense, use } from 'react';

import { createFileRoute, notFound } from '@tanstack/react-router';

import Main, { MainContainer } from '@@frontend-v5/components/Main';
import { SITE_URL } from '@@frontend-v5/constants/site';
import { getPage, type PageEntry } from '@@frontend-v5/content/pages';
import { mdxComponents } from '@@frontend-v5/elements';
import Page from '@@frontend-v5/layouts/Page';
import formatTitle from '@@frontend-v5/utils/formatTitle';

// Static page — the v5 equivalent of v4's `pages/pages/[slug].astro`. As with
// posts, the `$slug` param resolves against the build-time `pages` map in the
// loader, unknown / production-draft pages throw `notFound()`, and the content
// is wrapped in the v5 Page layout.
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
    return { title: page.title, slug: page.slug };
  },
  component: PageRoute,
});

// Renders the page's MDX body. The `use()` call suspends this component while
// the page's MDX chunk is fetched; the `<Suspense>` boundary in `PageRoute`
// (below) scopes that suspension, so an empty `<Main>`/`<MainContainer>` is shown
// in place of the layout while the content loads.
function PageContent(props: { slug: string }) {
  const { default: Content } = use(import(`@@contents/pages/${props.slug}.mdx`));
  return <Content components={mdxComponents} />;
}

function PageRoute() {
  const pageData: PageEntry = Route.useLoaderData();

  return (
    <Suspense
      fallback={
        <Main>
          <MainContainer />
        </Main>
      }
    >
      <Page title={pageData.title}>
        <PageContent slug={pageData.slug} />
      </Page>
    </Suspense>
  );
}
