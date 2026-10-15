import { Outlet, ScrollRestoration, useLocation } from '@modern-js/runtime/router';

import { LoadingIndicator } from '@@frontend/components';
import RootLayout from '@@frontend/components/RootLayout';
import Providers from '@@frontend/providers';

const Layout = () => {
  const { pathname } = useLocation();
  const headerKind = pathname === '/' ? 'home' : 'default';

  return (
    <Providers>
      <LoadingIndicator />
      <RootLayout headerKind={headerKind}>
        <Outlet />
      </RootLayout>
      <ScrollRestoration />
    </Providers>
  );
};

export default Layout;
