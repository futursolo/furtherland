import type { ReactNode } from 'react';

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from 'react-router';

import { NotFound, ThemePreloadScript } from '@@frontend/components';
import { SITE_NAME, SITE_URL } from '@@frontend/constants/site';
import RootLayout from '@@frontend/layouts/Root';
import Providers from '@@frontend/providers';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import type { Route } from './+types/root';

export const meta: Route.MetaFunction = ({ matches }: Route.MetaArgs): Route.MetaDescriptors => {
  const hasNotFound = matches.some(
    (m) => m !== undefined && isRouteErrorResponse(m.error) && m.error.status === 404,
  );

  const result: Route.MetaDescriptors = [...baseMeta];
  if (hasNotFound) {
    result.push({ title: formatTitle('404 Not Found') }, { name: 'robots', content: 'noindex' });
  }

  return result;
};

export const links: Route.LinksFunction = () => [
  {
    rel: 'alternate',
    type: 'application/atom+xml',
    title: SITE_NAME,
    href: `${SITE_URL}/atom.xml`,
  },
  { rel: 'sitemap', type: 'application/xml', href: `${SITE_URL}/sitemap-index.xml` },
];

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemePreloadScript />
        <Meta />
        <Links />
      </head>
      <body>
        <Providers>{children}</Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const Root = () => {
  const { pathname } = useLocation();
  const headerKind = pathname === '/' ? 'home' : 'default';

  return (
    <RootLayout headerKind={headerKind}>
      <Outlet />
    </RootLayout>
  );
};

export default Root;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  console.log(error);
  if (
    (isRouteErrorResponse(error) && error.status === 404) ||
    // Workaround to create 404 at runtime.
    (error instanceof Error && error.message.includes('No result found for routeId '))
  ) {
    return (
      <RootLayout headerKind="default">
        <NotFound />
      </RootLayout>
    );
  }

  return (
    <main style={{ maxWidth: '60ch', margin: '0 auto', padding: '2rem' }}>
      <h1>Something went wrong</h1>
      {error instanceof Error && <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>}
    </main>
  );
};
