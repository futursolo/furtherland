import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Outlet, Scripts, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { Box, ThemePreloadScript } from '@@frontend-v5/components';
import { SITE_NAME } from '@@frontend-v5/constants/site';
import Root from '@@frontend-v5/layouts/Root';

// Fallback shown when no route matches (or a route throws `notFound()`). A
// self-contained 404 using the v5 `Box` component — mirrors v4's `404.astro`.
const NotFound = () => {
  return (
    <Box
      style={{
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 20,
      }}
    >
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.2rem' }}>Oops! Page Not Found.</p>
      <a href="/" style={{ color: 'var(--fl-theme-main-colour-primary)' }}>
        Go back home
      </a>
    </Box>
  );
};

// Common wrapper rendered for every route: the v5 Root layout (ThemeProvider +
// Header + Footer) around the matched route. `headerKind` mirrors v4, which used
// the full-height header only on the home page.
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
// are injected by the `ThemeProvider`'s Emotion `<Global>` (see
// `providers/theme.tsx`), so no stylesheet link is needed here.
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1.0,viewport-fit=cover' },
      { property: 'og:site_name', content: SITE_NAME },
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
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
