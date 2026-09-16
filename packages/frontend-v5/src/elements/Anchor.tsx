import { styled } from '@@frontend-v5/utils';

const Anchor = styled('a')(({ theme }) => ({
  color: theme.colour.primary.cssVar,
  fontWeight: 'bold',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
}));

export default Anchor;
