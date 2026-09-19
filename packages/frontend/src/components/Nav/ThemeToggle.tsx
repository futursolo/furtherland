import { FiMoon, FiSun } from 'react-icons/fi';

import themeAtom, { persistThemeKind } from '@@frontend/atoms/theme';
import { styled } from '@@frontend/utils';

const ThemeToggleLayout = styled.div({
  position: 'relative',
  height: 60,
  width: 60,
});

const Button = styled.button<{ $position: 'top' | 'default' }>(({ theme, $position }) => ({
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
  color: $position === 'top' ? theme.fontColour.primary.cssVar : 'rgb(255, 255 ,255)',

  opacity: 0,
  pointerEvents: 'none',
  zIndex: 0,

  transition: 'opacity 0.3s, color 0.3s',
}));

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

interface ThemeToggleProps {
  position: 'top' | 'default';
}

const ThemeToggle = (props: ThemeToggleProps) => {
  const { position } = props;

  const toggleTheme = () => {
    const nextThemeKind = themeAtom.get() === 'light' ? 'dark' : 'light';
    persistThemeKind(nextThemeKind);
    themeAtom.set(nextThemeKind);
  };

  return (
    <ThemeToggleLayout>
      <LightButton
        $position={position}
        type="button"
        title="Switch to Dark Theme"
        aria-label="Switch to Dark Theme"
        onClick={toggleTheme}
      >
        <FiMoon size={24} />
      </LightButton>
      <DarkButton
        $position={position}
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
