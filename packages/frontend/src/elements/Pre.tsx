import { styled } from '@@frontend/utils';

const Pre = styled('pre')(({ theme }) => ({
  backgroundColor: `${theme.colour.background.code.cssVar} !important`,
  padding: '1.5rem',
  borderRadius: 4,
  overflowY: 'auto',
  '& > code': {
    paddingLeft: 0,
    paddingRight: 0,
  },

  transition: 'background-color 0.3s, color 0.3s',

  'html[data-theme=dark] &, html[data-theme=dark] & span': {
    color: 'var(--shiki-dark) !important',
    fontStyle: 'var(--shiki-dark-font-style) !important',
    fontWeight: 'var(--shiki-dark-font-weight) !important',
    textDecoration: 'var(--shiki-dark-text-decoration) !important',
    transition: 'background-color 0.3s, color 0.3s',
  },
}));

export default Pre;
