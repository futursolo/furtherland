import type React from 'react';

import Styles from './Box.module.scss';

// Layout primitive, the React counterpart of the Astro `Box.astro` component.
// Renders a flex column with border-box sizing. Styled with SCSS
// (`./Box.module.scss`) rather than Emotion. A passed `className` is combined
// with the base `box` class; `style` is forwarded to the element. Box is a
// non-interactive layout wrapper — an interactive control should use a real
// element (e.g. `<button>`) instead of attaching handlers here.
interface BoxProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Box = (props: BoxProps) => {
  const { className, style, children } = props;

  return (
    <div className={className ? `${Styles.box} ${className}` : Styles.box} style={style}>
      {children}
    </div>
  );
};

export default Box;
