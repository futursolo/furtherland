import type { PropsWithChildren } from 'react';

import { useIntersectionObserver } from 'usehooks-ts';

import { styled } from '@@frontend/utils';

const Sentinel = styled.div({ height: 0 });

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
