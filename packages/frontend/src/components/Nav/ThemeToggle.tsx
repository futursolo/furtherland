import { FiMoon, FiSun } from 'react-icons/fi';

import themeAtom, { persistThemeKind } from '@@frontend/atoms/theme';

import Styles from './ThemeToggle.module.scss';

const ThemeToggle = () => {
  const toggleTheme = () => {
    const nextThemeKind = themeAtom.get() === 'light' ? 'dark' : 'light';
    persistThemeKind(nextThemeKind);
    themeAtom.set(nextThemeKind);
  };

  console.log(Styles);

  // Both buttons (and thus both icons *and* both alt texts) are always in the
  // DOM; CSS shows exactly one via `html[data-theme=...]`. Toggling only flips
  // that attribute, so this component never re-renders.
  return (
    <div className={Styles['theme-toggle']}>
      <button
        type="button"
        className={`${Styles.button} ${Styles['button-light']}`}
        title="Switch to Dark Theme"
        aria-label="Switch to Dark Theme"
        onClick={toggleTheme}
      >
        <FiMoon size={24} />
      </button>
      <button
        type="button"
        className={`${Styles.button} ${Styles['button-dark']}`}
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
