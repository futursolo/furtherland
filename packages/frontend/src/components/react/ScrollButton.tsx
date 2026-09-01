import { FiChevronDown } from 'react-icons/fi';

import Box from './Box';
import Styles from './ScrollButton.module.scss';

// The home page header's scroll hint. A small React island (the only interactive
// leaf of the server-rendered `Header`) whose click smooth-scrolls to `<main>`.
// A `Box` wrapper keeps the original box the hint occupied (so the surrounding
// layout is unchanged); a real `<button>` inside it hugs just its icon. Styled
// with the adjacent `./ScrollButton.module.scss`.
const scrollToMain = () => {
  const mainEl = document.querySelector('main');
  if (!mainEl) {
    return;
  }
  mainEl.scrollIntoView({ behavior: 'smooth' });
};

const ScrollButton = () => (
  <Box className={Styles.box}>
    <button type="button" className={Styles.button} onClick={scrollToMain}>
      <FiChevronDown />
    </button>
  </Box>
);

export default ScrollButton;
