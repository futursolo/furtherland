import type { PropsWithChildren } from 'react';

import { Provider } from 'jotai';

import ThemeProvider from './theme';

const Providers = (props: PropsWithChildren) => {
  const { children } = props;

  return (
    <Provider>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
};

export default Providers;
