import type { ComponentType } from 'react';

import ThemeProvider from './theme';

export function withThemeProvider<P extends React.JSX.IntrinsicAttributes>(
  Component: ComponentType<P>,
) {
  const WithThemeProvider = (props: P) => (
    <ThemeProvider>
      <Component {...props} />
    </ThemeProvider>
  );
  return WithThemeProvider;
}
