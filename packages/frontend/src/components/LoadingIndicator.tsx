import { useEffect, useRef } from 'react';

import { useNavigation } from 'react-router';

import { styled } from '@@frontend/utils';

const Bar = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  height: 3,
  zIndex: 9999,
  pointerEvents: 'none',
  backgroundColor: 'var(--fl-theme-main-colour-primary)',
  width: 0,
  opacity: 0,

  '&.is-loading': {
    width: '100%',
    opacity: 1,
    transition: 'width 500ms ease-out, opacity 200ms ease',
  },

  '&.is-done': {
    width: '100%',
    opacity: 0,
    transition: 'width 200ms ease-out, opacity 350ms ease',
  },
});

const LoadingIndicator = () => {
  const { state } = useNavigation();
  const isNavigating = state === 'loading';
  const ref = useRef<HTMLDivElement>(null);
  const wasNavigating = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isNavigating === wasNavigating.current) {
      return;
    }
    wasNavigating.current = isNavigating;

    if (isNavigating) {
      el.classList.remove('is-loading', 'is-done');
      void el.offsetWidth;
      el.classList.add('is-loading');
      return;
    }

    el.classList.remove('is-loading');
    el.classList.add('is-done');
    const timer = window.setTimeout(() => {
      el.classList.remove('is-loading', 'is-done');
    }, 400);
    return () => window.clearTimeout(timer);
  }, [isNavigating]);

  return <Bar ref={ref} />;
};

export default LoadingIndicator;
