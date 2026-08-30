import { atom } from 'nanostores';

export const getThemeKind = () => {
  if (import.meta.env.SSR) {
    // We use light theme for ssr
    return 'light';
  }

  const theme = localStorage.getItem('fl_theme');

  if (theme) {
    try {
      const themeState = JSON.parse(theme);

      if (Date.now() / 1000 - themeState.last_updated <= 6 * 60 * 60) {
        const themeKind = themeState.kind;

        if (themeKind === 'light') {
          return 'light';
        }
        if (themeKind === 'dark') {
          return 'dark';
        }
      }
    } catch (_e) {
      // does nothing
    }
  }

  // We remove the persisted value if we do not recognise it.
  localStorage.removeItem('fl_theme');

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

export const persistThemeKind = (kind: 'light' | 'dark') => {
  window.localStorage.setItem(
    'fl_theme',
    JSON.stringify({ kind, last_updated: Date.now() / 1000 }),
  );
};

const themeAtom = atom<'light' | 'dark'>(getThemeKind());

export default themeAtom;
