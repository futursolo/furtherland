import { FiChevronDown } from 'react-icons/fi';

import Box from '@@frontend-v5/components/Box';
import { styled } from '@@frontend-v5/utils';

const Layout = styled(Box)({
  width: '100%',

  flexGrow: 1,
  flexBasis: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
});
const ScrollLayout = styled(Box)(({ theme }) => ({
  height: 100,
  fontSize: 100,

  [theme.breakpoint.sm.mediaDown()]: {
    height: 60,
    fontSize: 60,
  },
}));

const ScrollButton = styled(Box)({ cursor: 'pointer', boxSizing: 'border-box' });

const Title = styled(Box)(({ theme }) => ({
  fontSize: '5rem',
  userSelect: 'none',
  cursor: 'default',

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

const HomeContent = () => {
  const scrollToMain = () => {
    const mainEl = document.querySelector('main');
    if (!mainEl) {
      return;
    }

    mainEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <Title>Hoshikawa&apos;s Secret Room</Title>
      <ScrollLayout>
        <ScrollButton onClick={scrollToMain}>
          <FiChevronDown />
        </ScrollButton>
      </ScrollLayout>
    </Layout>
  );
};

export default HomeContent;
