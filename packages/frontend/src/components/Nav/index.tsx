import { useEffect, useState } from 'react';

import Box from '@@frontend/components/Box';
import FlexSpace from '@@frontend/components/FlexSpace';

import LinkItem from './LinkItem';
import Styles from './Nav.module.scss';
import ThemeToggle from './ThemeToggle';

const Links = () => {
  return (
    <>
      <a className={Styles['unstyled-link']} href="/">
        <LinkItem colour="rgba(92, 184, 230, 0.9)">Home</LinkItem>
      </a>
      <a className={Styles['unstyled-link']} href="/pages/about">
        <LinkItem colour="rgba(255, 242, 66, 0.9)">About</LinkItem>
      </a>
      <a className={Styles['unstyled-link']} href="/pages/links">
        <LinkItem colour="rgba(230, 117, 92, 0.9)">Links</LinkItem>
      </a>
    </>
  );
};

export const NavPlaceholder = () => <Box className={Styles['placeholder']} />;

const Nav = () => {
  const [layoutEl, setLayoutEl] = useState<HTMLElement | null>(null);
  const [navPos, setNavPos] = useState<'top' | 'default'>('default');

  useEffect(() => {
    if (layoutEl) {
      const listener = () => {
        const { top } = layoutEl.getBoundingClientRect();

        if (top <= 0) {
          setNavPos('top');
        } else {
          setNavPos('default');
        }
      };

      listener();

      window.addEventListener('scroll', listener);
      window.addEventListener('resize', listener);
      window.screen.orientation.addEventListener('change', listener);
      return () => {
        window.screen.orientation.removeEventListener('change', listener);
        window.removeEventListener('scroll', listener);
        window.removeEventListener('resize', listener);
      };
    }

    return () => {};
  }, [layoutEl]);

  return (
    <nav className={Styles.layout} ref={setLayoutEl} style={{ paddingLeft: 0, paddingRight: 0 }}>
      <nav className={navPos === 'top' ? `${Styles.inner} ${Styles['inner-top']}` : Styles.inner}>
        <Links />
        <FlexSpace />
        <ThemeToggle />
      </nav>
    </nav>
  );
};

export default Nav;
