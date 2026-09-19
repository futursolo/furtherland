import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { NotFound, ThemePreloadScript } from '@@frontend/components';
import { SITE_NAME, SITE_URL } from '@@frontend/constants/site';
import Root from '@@frontend/layouts/Root';
import Providers from '@@frontend/providers';
import formatTitle from '@@frontend/utils/formatTitle';

function RootShell() {
  const { pathname } = useLocation();
  const headerKind = pathname === '/' ? 'home' : 'default';

  return (
    <Root headerKind={headerKind}>
      <Outlet />
    </Root>
  );
}

export const Route = createRootRoute({
  head: ({ match }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1.0,viewport-fit=cover' },
      { property: 'og:site_name', content: SITE_NAME },
      ...(match._notFound
        ? [{ title: formatTitle('404 Not Found') }, { name: 'robots', content: 'noindex' }]
        : []),
    ],
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
