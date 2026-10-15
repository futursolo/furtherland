import type { PropsWithChildren } from 'react';

import Box from '@@frontend/components/Box';
import Footer from '@@frontend/components/Footer';
import Header from '@@frontend/components/Header';
import { styled } from '@@frontend/utils';

const RootLayoutBox = styled(Box)({
  width: '100%',
  minHeight: '100%',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const RootLayout = (props: PropsWithChildren<{ headerKind: 'home' | 'default' }>) => {
  const { children, headerKind } = props;

  return (
    <RootLayoutBox>
      <Header headerKind={headerKind} />
      {children}
      <Footer />
    </RootLayoutBox>
  );
};

export default RootLayout;
