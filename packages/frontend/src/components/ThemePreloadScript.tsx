const THEME_INIT_SCRIPT = `(() => {
  const theme = localStorage.getItem('fl_theme');

  if (theme) {
    try {
      const themeState = JSON.parse(theme);

      if (Date.now() / 1000 - themeState.last_updated <= 6 * 60 * 60) {
        const themeKind = themeState.kind;

        if (themeKind === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
          return;
        }
        if (themeKind === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          return;
        }
      }
    } catch (_e) {
      // does nothing
    }
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();`;

const ThemePreloadScript = () => {
  return <script>{THEME_INIT_SCRIPT}</script>;
};

export default ThemePreloadScript;
