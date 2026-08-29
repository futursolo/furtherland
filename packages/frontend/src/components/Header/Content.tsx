import Box from '@@frontend/components/Box';
import { SITE_NAME } from '@@frontend/constants/site';
import { theme } from '@@frontend/providers/theme';
import { styled } from '@@frontend/utils';

const Layout = styled(Box)({
  height: 1,
  width: '100%',

  flexGrow: 1,
  flexBasis: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
});

const Title = styled(Box)({
  userSelect: 'none',
  cursor: 'default',

  fontSize: '5rem',

  [theme.breakpoint.lg.mediaDown()]: {
    fontSize: '4rem',
  },

  [theme.breakpoint.md.mediaDown()]: {
    fontSize: '3rem',
  },

  [theme.breakpoint.sm.mediaDown()]: {
    fontSize: '2rem',
  },
});

const Content = () => (
  <Layout>
    <Title>{SITE_NAME}</Title>
  </Layout>
);

export default Content;
