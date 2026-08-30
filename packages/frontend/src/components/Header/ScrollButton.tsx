import { FiChevronDown } from 'react-icons/fi';

import './ScrollButton.scss';

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
  <button
    type="button"
    className="scroll-button"
    aria-label="Scroll to main content"
    onClick={scrollToMain}
  >
    <FiChevronDown />
  </button>
);

export default ScrollButton;
