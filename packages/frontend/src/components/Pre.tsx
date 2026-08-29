import { withThemeProvider } from '@@frontend/providers/withThemeProvider';
import { styled } from '@@frontend/utils';

const Pre = styled('pre')(({ theme }) => ({
  backgroundColor: `${theme.colour.background.code.cssVar} !important`,
  padding: '1.5rem',
  borderRadius: 4,
  '& > code': {
    paddingLeft: 0,
    paddingRight: 0,
  },

  'html[data-theme=dark] &, html[data-theme=dark] & span': {
    color: 'var(--shiki-dark) !important',
    fontStyle: 'var(--shiki-dark-font-style) !important',
    fontWeight: 'var(--shiki-dark-font-weight) !important',
    textDecoration: 'var(--shiki-dark-text-decoration) !important',
  },
}));

export default withThemeProvider(Pre);
