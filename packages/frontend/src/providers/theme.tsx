import { type PropsWithChildren, useEffect } from 'react';

import { ThemeProvider as BaseProvider, Global } from '@emotion/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMediaQuery } from 'usehooks-ts';

import { globalStyles, theme } from '@@common/providers/theme';
import themeAtom, { getThemeKind } from '@@frontend/atoms/theme';

const ThemeProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const prefersDarkTheme = useMediaQuery('(prefers-color-scheme: dark)');
  const themeKind = useAtomValue(themeAtom);
  const setThemeKind = useSetAtom(themeAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getThemeKind is a stable function, no need to include it in deps
  useEffect(() => {
    setThemeKind(getThemeKind());
  }, [prefersDarkTheme, setThemeKind]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeKind);
  }, [themeKind]);

  return (
    <BaseProvider theme={theme}>
      <Global styles={globalStyles} />
      {children}
    </BaseProvider>
  );
};

export default ThemeProvider;
