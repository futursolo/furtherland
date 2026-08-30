import { theme } from '@@frontend/theme';
import { styled } from '@@frontend/utils';

const Main = styled.main({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',

  boxSizing: 'border-box',

  paddingLeft: 'max(20px, env(safe-area-inset-left))',
  paddingRight: 'max(20px, env(safe-area-inset-right))',
  paddingTop: 20,
  paddingBottom: 20,

  minHeight: 'auto',
});

export const MainContainer = styled.div({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',

  width: '100%',
  maxWidth: theme.breakpoint.md.width,
});

export default Main;
