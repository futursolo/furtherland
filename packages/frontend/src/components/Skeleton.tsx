import { keyframes } from '@emotion/react';

import { styled } from '@@frontend/utils';

export type SkeletonKind = 'rect' | 'circle';

export interface SkeletonProps {
  height: string;
  width: string;
  kind?: SkeletonKind;
  setDataStatus?: boolean;
}

const wave = keyframes`
  from {
    transform: translateX(-100px);
  }
  to {
    transform: translateX(100%);
  }
`;

const Root = styled.div<{ $height: string; $width: string; $radius: string }>(
  ({ $height, $width, $radius, theme }) => ({
    height: $height,
    width: $width,
    borderRadius: $radius,
    backgroundColor: theme.colour.background.code.cssVar,
    overflowX: 'hidden',
    overflowY: 'hidden',
    transition: '0.3s background-color',
    WebkitMaskImage: '-webkit-radial-gradient(center, white, black)',
  }),
);

const Wave = styled.div({
  width: '100%',
  height: '100%',
  animationName: wave,
  animationDelay: '0.5s',
  animationDuration: '1.6s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
  transform: 'translateX(-100px)',
});

const WaveGradient = styled.div({
  backgroundImage:
    'linear-gradient(to right, rgba(255, 255, 255, 0), rgb(255, 255, 255, 0.7), rgba(255, 255, 255, 0))',
  width: '100px',
  height: '100%',
  transition: '0.3s background-image',
  'html[data-theme=dark] &': {
    backgroundImage:
      'linear-gradient(to right, rgba(255, 255, 255, 0), rgb(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
  },
});

const Skeleton = ({ height, width, kind = 'rect', setDataStatus = true }: SkeletonProps) => {
  const radius = kind === 'circle' ? '50%' : '2px';

  return (
    <Root
      $height={height}
      $width={width}
      $radius={radius}
      data-status={setDataStatus ? 'loading' : undefined}
    >
      <Wave>
        <WaveGradient />
      </Wave>
    </Root>
  );
};

export default Skeleton;
