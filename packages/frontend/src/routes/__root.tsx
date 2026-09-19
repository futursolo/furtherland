import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { NotFound, ThemePreloadScript } from '@@frontend/components';
import { SITE_NAME, SITE_URL } from '@@frontend/constants/site';
import Root from '@@frontend/layouts/Root';
import Providers from '@@frontend/providers';
import formatTitle from '@@frontend/utils/formatTitle';

// Fallback shown when no route matches (or a route throws `notFound()`). The root
// `component` (`RootShell`) still renders the site chrome (`Root`: Header + Footer);
// the not-found component is rendered inside its `<Outlet />`, so it is the bare
// `NotFound` content — the same way a normal child route renders inside `RootShell`.
// This reproduces v4's full-page `404.astro` (chrome + centred message).

// Common wrapper rendered for every route: the `Root` layout (Header + Footer)
// around the matched route. Theme provisioning lives in the document shell
// (`RootDocument`), which wraps this in `Providers`.
function RootShell() {
  const { pathname } = useLocation();
  const headerKind = pathname === '/' ? 'home' : 'default';

  return (
    <Root headerKind={headerKind}>
      <Outlet />
    </Root>
  );
}

// Site-wide head. Per-route head (title, description, canonical, og:* and
// article:*) lives on each route so tags are not duplicated between the root and a
// matched route. The global `--fl-theme-*` variables and base `html, body` rules
// are injected by the `ThemeProvider`'s Emotion `<Global>` (loaded once via
// `Providers` in `RootDocument`, see `providers/theme.tsx`), so no stylesheet
// link is needed here.
export const Route = createRootRoute({
  head: ({ match }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1.0,viewport-fit=cover' },
      { property: 'og:site_name', content: SITE_NAME },
      // The root head is shared by every route. Only when the matched tree is a
      // not-found (a loader threw `notFound()` or no route matched, which sets
      // `match._notFound`) do we emit a `404 Not Found` title and a `noindex` robots meta
      ...(match._notFound
        ? [{ title: formatTitle('404 Not Found') }, { name: 'robots', content: 'noindex' }]
        : []),
    ],
    // The Atom feed is served at `/atom.xml` (see `routes/atom[.]xml.ts` +
    // `server/feed.server.ts`), alongside the sitemap index pointing at
    // `/sitemap-index.xml`, the `<sitemapindex>` that references `/sitemap-0.xml`.
    links: [
      {
        rel: 'alternate',
        type: 'application/atom+xml',
        title: SITE_NAME,
        href: `${SITE_URL}/atom.xml`,
      },
      { rel: 'sitemap', type: 'application/xml', href: `${SITE_URL}/sitemap-index.xml` },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootShell,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemePreloadScript />
        <HeadContent />
      </head>
      <body>
        <Providers>{children}</Providers>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
