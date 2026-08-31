import type React from 'react';

import Box from '@@frontend/components/Box';

import Styles from './LinkItem.module.scss';

interface NavLinkItemProps {
  children: React.ReactNode | null | undefined;
  colour: string;
}

const Item = (props: NavLinkItemProps) => {
  const { children, colour } = props;

  return (
    <Box className={Styles.layout}>
      <Box className={Styles.text}>{children}</Box>
      <Box className={Styles.indicator} style={{ backgroundColor: colour }} />
    </Box>
  );
};

export default Item;
