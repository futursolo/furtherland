import type { PropsWithChildren } from 'react';

import ThemeProvider from './theme';

const Providers = (props: PropsWithChildren) => {
  const { children } = props;

  return <ThemeProvider>{children}</ThemeProvider>;
};

export default Providers;
