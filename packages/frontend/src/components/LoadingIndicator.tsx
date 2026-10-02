import { useNavigation } from 'react-router';

import { styled } from '@@frontend/utils';

const Bar = styled.div<{ $active: boolean }>(({ $active, theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  height: 3,
  zIndex: 9999,
  pointerEvents: 'none',
  backgroundColor: theme.colour.primary.cssVar,
  width: $active ? '100%' : 0,
  opacity: $active ? 1 : 0,
  transition: 'width 0.6s ease-out, opacity 0.3s ease',
  transitionDelay: $active ? '0s' : '0.1s',
}));

const LoadingIndicator = () => {
  const { state } = useNavigation();

  return <Bar $active={state === 'loading'} />;
};

export default LoadingIndicator;
