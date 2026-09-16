import type { PropsWithChildren } from 'react';

import { useIntersectionObserver } from 'usehooks-ts';

import { styled } from '@@frontend-v5/utils';

const Sentinel = styled.div({ height: 0 });

// Like `ClientOnly`, but only renders its children once scrolled into view.
// A zero-height sentinel div (always rendered, so SSR/hydration-safe) is observed
// via `useIntersectionObserver`; the children render once the sentinel becomes
// visible, then stay mounted (frozen).
const LazyOnly = (props: PropsWithChildren) => {
  const { children } = props;

  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px 0px',
    freezeOnceVisible: true,
  });

  return (
    <>
      <Sentinel ref={ref} />
      {isIntersecting ? children : null}
    </>
  );
};

export default LazyOnly;
