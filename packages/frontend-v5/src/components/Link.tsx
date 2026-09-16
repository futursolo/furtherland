import { styled } from '@@frontend-v5/utils';

const Link = styled('a')(({ theme }) => ({
  color: theme.colour.primary.cssVar,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
}));

export default Link;
