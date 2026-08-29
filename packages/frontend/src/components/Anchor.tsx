import { theme } from '@@frontend/providers/theme';
import { styled } from '@@frontend/utils';

const Anchor = styled('a')({
  color: theme.colour.primary.cssVar,
  fontWeight: 'bold',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});

export default Anchor;
