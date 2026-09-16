import type { PropsWithChildren } from 'react';

import { Box, Footer, Header } from '@@frontend-v5/components';
import { styled } from '@@frontend-v5/utils';

const RootLayout = styled(Box)({
  width: '100%',
  minHeight: '100%',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const Layout = (props: PropsWithChildren<{ headerKind: 'home' | 'default' }>) => {
  const { children, headerKind } = props;

  return (
    <RootLayout>
      <Header headerKind={headerKind} />
      {children}
      <Footer />
    </RootLayout>
  );
};

export default Layout;
