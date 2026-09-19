import { styled } from '@@frontend/utils';

const Anchor = styled('a')(({ theme }) => ({
  color: theme.colour.primary.cssVar,
  fontWeight: 'bold',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
}));

export default Anchor;
