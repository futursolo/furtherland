import { FiMoon, FiSun } from 'react-icons/fi';

import themeAtom, { persistThemeKind } from '@@frontend/atoms/theme';

import Styles from './ThemeToggle.module.scss';

interface ThemeToggleProps {
  // Populate the nav position to prevent safari text colour bug.
  navPosition: 'top' | 'default';
}

const ThemeToggle = (props: ThemeToggleProps) => {
  const { navPosition } = props;

  const toggleTheme = () => {
    const nextThemeKind = themeAtom.get() === 'light' ? 'dark' : 'light';
    persistThemeKind(nextThemeKind);
    themeAtom.set(nextThemeKind);
  };

  // Both buttons (and thus both icons *and* both alt texts) are always in the
  // DOM; CSS shows exactly one via `html[data-theme=...]`. Toggling only flips
  // that attribute, so this component never re-renders.
  return (
    <div className={Styles['theme-toggle']}>
      <button
        type="button"
        className={[
          Styles.button,
          Styles['button-light'],
          ...(navPosition === 'top' ? [Styles['button-nav-fixed']] : []),
        ].join(' ')}
        title="Switch to Dark Theme"
        aria-label="Switch to Dark Theme"
        onClick={toggleTheme}
      >
        <FiMoon size={24} />
      </button>
      <button
        type="button"
        className={[
          Styles.button,
          Styles['button-dark'],
          ...(navPosition === 'top' ? [Styles['button-nav-fixed']] : []),
        ].join(' ')}
        title="Switch to Light Theme"
        aria-label="Switch to Light Theme"
        onClick={toggleTheme}
      >
        <FiSun size={24} />
      </button>
    </div>
  );
};

export default ThemeToggle;
