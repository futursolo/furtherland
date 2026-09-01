import { useEffect } from 'react';

import { useStore } from '@nanostores/react';
import { useMediaQuery } from 'usehooks-ts';

import themeAtom, { getThemeKind } from '@@frontend/atoms/theme';

const SyncTheme = () => {
  const prefersDarkTheme = useMediaQuery('(prefers-color-scheme: dark)');
  const themeKind = useStore(themeAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getThemeKind is a stable function, no need to include it in deps
  useEffect(() => {
    themeAtom.set(getThemeKind());
  }, [prefersDarkTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeKind);
  }, [themeKind]);

  return null;
};

export default SyncTheme;
