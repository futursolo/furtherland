import type React from 'react';

import Box from '@@frontend/components/Box';
import { styled } from '@@frontend/utils';

interface NavLinkItemProps {
  children: React.ReactNode | null | undefined;
  colour: string;
}

const Layout = styled(Box)({
  height: 60,
  fontSize: '1.1rem',
  fontWeight: 'bold',
  paddingLeft: 15,
  paddingRight: 15,

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  cursor: 'pointer',
  userSelect: 'none',

  '&:hover .nav-link-item-indicator': {
    width: '100%',
  },
});

const Indicator = styled(Box)({
  height: 3,
  width: '0%',
  transition: 'width 0.2s ease-out',
});
const Text = styled(Box)({
  flexGrow: 1,
  lineHeight: '57px',
});

const Item = (props: NavLinkItemProps) => {
  const { children, colour } = props;

  return (
    <Layout>
      <Text>{children}</Text>
      <Indicator className="nav-link-item-indicator" style={{ backgroundColor: colour }} />
    </Layout>
  );
};

export default Item;
