import { styled } from '@@frontend/utils';

const Link = styled('a')(({ theme }) => ({
  color: theme.colour.primary.cssVar,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
}));

export default Link;
