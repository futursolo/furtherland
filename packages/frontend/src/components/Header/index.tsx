import Box from '@@frontend/components/Box';
import FlexSpace from '@@frontend/components/FlexSpace';
import Nav from '@@frontend/components/Nav';
import { theme } from '@@frontend/theme';
import { styled } from '@@frontend/utils';

import Content from './Content';
import HeaderBackground from './HeaderBackground';
import HomeContent from './HomeContent';

const HeaderLayout = styled.header({
  width: '100%',
  color: 'white',
  height: 200,

  boxShadow: '0 0 10px 5px rgba(0, 0, 0, 0.3)',

  '&.no-shadow': {
    boxShadow: 'none',
  },

  '&.is-home': {
    height: '100vh',
  },

  [theme.breakpoint.md.mediaUp()]: {
    height: 300,

    '&.is-home': {
      height: '100vh',
    },
  },
});

const HeaderContainer = styled(Box)({
  backgroundColor: theme.colour.background.header.cssVar,
  transition: 'background-color 0.3s',

  width: '100%',
  height: '100%',

  position: 'relative',
  zIndex: 10,

  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const StickyHeader = styled(Box)({
  height: '65%',
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',

  position: 'sticky',
  bottom: 0,
});

const Header = (props: { headerKind: 'home' | 'default' }) => {
  const { headerKind } = props;

  return (
    <HeaderLayout className={headerKind === 'home' ? 'is-home' : undefined}>
      <HeaderBackground headerKind={headerKind} />
      <HeaderContainer>
        <FlexSpace />
        <StickyHeader>
          {headerKind === 'home' ? <HomeContent /> : <Content />}
          <Nav />
        </StickyHeader>
      </HeaderContainer>
    </HeaderLayout>
  );
};

export default Header;
