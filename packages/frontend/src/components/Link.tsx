import { theme } from '@@frontend/theme';
import { styled } from '@@frontend/utils';

const Link = styled('a')({
  color: theme.colour.primary.cssVar,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});

export default Link;
