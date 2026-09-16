import Box from '@@frontend-v5/components/Box';
import { styled } from '@@frontend-v5/utils';

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

const Title = styled(Box)(({ theme }) => ({
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
}));

const Content = () => (
  <Layout>
    <Title>Hoshikawa&apos;s Secret Room</Title>
  </Layout>
);

export default Content;
