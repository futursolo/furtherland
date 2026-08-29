import type { PropsWithChildren } from 'react';

import { Box, Footer, Header } from '@@frontend/components';
import Theme from '@@frontend/providers/theme';
import { styled } from '@@frontend/utils';

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
    <Theme>
      <RootLayout>
        <Header headerKind={headerKind} />
        {children}
        <Footer />
      </RootLayout>
    </Theme>
  );
};

export default Layout;
