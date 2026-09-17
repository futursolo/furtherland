import { FiMoon, FiSun } from 'react-icons/fi';

import themeAtom, { persistThemeKind } from '@@frontend-v5/atoms/theme';
import { styled } from '@@frontend-v5/utils';

const ThemeToggleLayout = styled.div({
  position: 'relative',
  height: 60,
  width: 60,
});

const Button = styled('button')({
  position: 'absolute',
  inset: 0,

  height: '100%',
  width: '100%',
  padding: 0,
  margin: 0,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',

  border: 'none',
  backgroundColor: 'transparent',
  // Inherits the nav's position-aware colour (white by default, the primary
  // font colour once the nav is pinned to the top). An explicit `inherit` also
  // sidesteps Safari's default button-colour quirk.
  color: 'inherit',

  opacity: 0,
  pointerEvents: 'none',
  zIndex: 0,

  transition: 'opacity 0.3s, color 0.3s',
});

// Both buttons live in the DOM at all times; exactly one is shown via the
// `html[data-theme]` attribute. That attribute is set pre-hydration by the theme
// preload script and kept in sync by the theme provider, so the correct button is
// visible on first paint (no flash) and SSR renders both buttons — no
// `ClientOnly` needed, and no hydration mismatch since the markup is static.
// Toggling only flips the attribute, so this component never re-renders.
const LightButton = styled(Button)({
  'html[data-theme="light"] &': {
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1,
  },
});

const DarkButton = styled(Button)({
  'html[data-theme="dark"] &': {
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1,
  },
});

const ThemeToggle = () => {
  const toggleTheme = () => {
    const nextThemeKind = themeAtom.get() === 'light' ? 'dark' : 'light';
    persistThemeKind(nextThemeKind);
    themeAtom.set(nextThemeKind);
  };

  return (
    <ThemeToggleLayout>
      <LightButton
        type="button"
        title="Switch to Dark Theme"
        aria-label="Switch to Dark Theme"
        onClick={toggleTheme}
      >
        <FiMoon size={24} />
      </LightButton>
      <DarkButton
        type="button"
        title="Switch to Light Theme"
        aria-label="Switch to Light Theme"
        onClick={toggleTheme}
      >
        <FiSun size={24} />
      </DarkButton>
    </ThemeToggleLayout>
  );
};

export default ThemeToggle;
