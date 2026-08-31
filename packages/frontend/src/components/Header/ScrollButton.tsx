import { FiChevronDown } from 'react-icons/fi';

import Styles from './ScrollButton.module.scss';

// The home page header's scroll hint. A small React island (the only interactive
// leaf of the server-rendered `Header`) whose click smooth-scrolls to `<main>`.
// A real `<button>` (not a static `<div>`), styled with the adjacent
// `./ScrollButton.module.scss`, since it is a single interactive control.
const scrollToMain = () => {
  const mainEl = document.querySelector('main');
  if (!mainEl) {
    return;
  }
  mainEl.scrollIntoView({ behavior: 'smooth' });
};

const ScrollButton = () => (
  <button type="button" className={Styles['scroll-button']} onClick={scrollToMain}>
    <FiChevronDown />
  </button>
);

export default ScrollButton;
