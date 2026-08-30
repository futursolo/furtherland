import { FiChevronDown } from 'react-icons/fi';

import Box from '../Box';
import Styles from './ScrollButton.module.scss';

// The home page header's scroll hint. A small React island (the only interactive
// leaf of the server-rendered `Header`) whose click smooth-scrolls to `<main>`.
// Styled with SCSS (`./ScrollButton.scss`) rather than Emotion, since it is the
// single button and the SCSS lives beside the component.
const scrollToMain = () => {
  const mainEl = document.querySelector('main');
  if (!mainEl) {
    return;
  }
  mainEl.scrollIntoView({ behavior: 'smooth' });
};

const ScrollButton = () => (
  <Box className={Styles['scroll-button']} onClick={scrollToMain}>
    <FiChevronDown />
  </Box>
);

export default ScrollButton;
