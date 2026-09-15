import type React from 'react';

import Styles from './LinkItem.module.scss';

interface NavLinkItemProps {
  children: React.ReactNode | null | undefined;
  colour: string;
}

const Item = (props: NavLinkItemProps) => {
  const { children, colour } = props;

  return (
    <div className={Styles.layout}>
      <div className={Styles.text}>{children}</div>
      <div className={Styles.indicator} style={{ backgroundColor: colour }} />
    </div>
  );
};

export default Item;
