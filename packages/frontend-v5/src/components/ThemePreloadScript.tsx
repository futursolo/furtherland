// Pre-hydration theme script. Runs before React hydrates to set `data-theme`
// on <html>, avoiding a flash of the wrong theme.
//
// Mirrors `getThemeKind()` in `@@frontend-v5/atoms/theme` (the `fl_theme`
// localStorage key). It is static and trusted (not user input), so it is safe
// to inline into <head>. Rendered into <head> by the root route's document, so
// the browser executes it while parsing <head> — before <body> and before React
// hydrates.
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
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, trusted pre-hydration theme script (not user input) */}
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
    </>
  );
};

export default ThemePreloadScript;
