import type { ComponentType, JSX, PropsWithChildren } from 'react';

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useStore } from '@nanostores/react';

import themeAtom from '@@common/atoms/theme';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme();

export const ThemeProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const themeKind = useStore(themeAtom);

  return (
    <MuiThemeProvider theme={themeKind === 'light' ? lightTheme : darkTheme}>
      {children}
    </MuiThemeProvider>
  );
};

export const withThemeProvider = <T extends JSX.IntrinsicAttributes>(Comp: ComponentType<T>) => {
  const FinalComponent = (props: T) => (
    <ThemeProvider>
      <Comp {...props} />
    </ThemeProvider>
  );

  return FinalComponent;
};
