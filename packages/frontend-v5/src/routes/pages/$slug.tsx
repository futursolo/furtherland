import { use } from 'react';

import { createFileRoute, notFound } from '@tanstack/react-router';

import { SITE_URL } from '@@frontend-v5/constants/site';
import { getPage, type PageEntry } from '@@frontend-v5/content/pages';
import { Anchor, Pre } from '@@frontend-v5/elements';
import Page from '@@frontend-v5/layouts/Page';
import formatTitle from '@@frontend-v5/utils/formatTitle';

// MDX element overrides — the v5 counterparts of v4's `Mdx/Anchor.astro` and
// `Mdx/Pre.astro`, passed to the compiled MDX component.
const mdxComponents = { a: Anchor, pre: Pre };

// Static page — the v5 equivalent of v4's `pages/pages/[slug].astro`. As with
// posts, the `$slug` param resolves against the build-time `pages` map in the
// loader, unknown / production-draft pages throw `notFound()`, and the content
// is wrapped in the v5 Page layout.
export const Route = createFileRoute('/pages/$slug')({
  head: ({ params }) => {
    const page = getPage(params.slug);
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
  loader: ({ params }) => {
    const page = getPage(params.slug);
    if (!page || (page.isDraft && import.meta.env.PROD)) throw notFound();
    return { title: page.title, slug: page.slug };
  },
  component: PageRoute,
});

function PageRoute() {
  const pageData: PageEntry = Route.useLoaderData();

  const { default: Content } = use(import(`@@contents/pages/${pageData.slug}.mdx`));

  return (
    <Page title={pageData.title}>
      <Content components={mdxComponents} />
    </Page>
  );
}
