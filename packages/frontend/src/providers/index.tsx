import type { PropsWithChildren } from 'react';

import { Provider } from 'jotai';

import MdxProvider from './mdx';
import ThemeProvider from './theme';

const Providers = (props: PropsWithChildren) => {
  const { children } = props;

  return (
    <Provider>
      <ThemeProvider>
        <MdxProvider>{children}</MdxProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default Providers;
