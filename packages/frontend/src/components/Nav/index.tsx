import { useEffect, useState } from 'react';

import { useStore } from '@nanostores/react';
import { FiMoon, FiSun } from 'react-icons/fi';

import themeAtom, { persistThemeKind } from '@@frontend/atoms/theme';
import Box from '@@frontend/components/Box';
import ClientOnly from '@@frontend/components/ClientOnly';
import FlexSpace from '@@frontend/components/FlexSpace';
import { theme } from '@@frontend/theme';
import { styled } from '@@frontend/utils';

import LinkItem from './LinkItem';

const UnstyledLink = styled('a')({
  color: 'inherit',
  textDecoration: 'none',
});

const Links = () => {
  return (
    <>
      <UnstyledLink href="/">
        <LinkItem colour="rgba(92, 184, 230, 0.9)">Home</LinkItem>
      </UnstyledLink>
      <UnstyledLink href="/pages/about">
        <LinkItem colour="rgba(255, 242, 66, 0.9)">About</LinkItem>
      </UnstyledLink>
      <UnstyledLink href="/pages/links">
        <LinkItem colour="rgba(230, 117, 92, 0.9)">Links</LinkItem>
      </UnstyledLink>
    </>
  );
};

const ThemeToggleLayout = styled(Box)({
  height: 60,
  width: 60,

  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
});

const ThemeToggle = () => {
  const themeKind = useStore(themeAtom);

  const toggleTheme = () => {
    const nextThemeKind = themeKind === 'light' ? 'dark' : 'light';
    persistThemeKind(nextThemeKind);
    themeAtom.set(nextThemeKind);
  };

  const themeIcon = themeKind === 'light' ? <FiMoon size={24} /> : <FiSun size={24} />;
  const altText = themeKind === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme';

  return (
    <ThemeToggleLayout title={altText} onClick={toggleTheme}>
      {themeIcon}
    </ThemeToggleLayout>
  );
};
const NavLayout = styled.nav({
  width: '100%',
  height: 60,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  transition: 'background 0.3s, color 0.3s',

  boxSizing: 'border-box',

  backgroundColor: 'rgba(255, 255, 255, 0)',

  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)',
});

export const NavPlaceholder = styled(Box)({ height: 60, width: '100%' });

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
    <NavLayout ref={setLayoutEl}>
      <NavLayout
        style={{
          color: 'rgb(255, 255, 255)',

          ...(navPos === 'top'
            ? {
                position: 'fixed',
                top: '0',

                backgroundColor: theme.colour.background.component.cssVar,
                color: theme.fontColour.primary.cssVar,

                boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.3)',
              }
            : {}),
        }}
      >
        <Links />
        <FlexSpace />
        <ClientOnly>
          <ThemeToggle />
        </ClientOnly>
      </NavLayout>
    </NavLayout>
  );
};

export default Nav;
