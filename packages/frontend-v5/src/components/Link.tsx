import { Link as RouterLink } from '@tanstack/react-router';

import { styled } from '@@frontend-v5/utils';

// The internal link: routes client-side through TanStack Router (no full page
// reload). External links use `elements/Anchor` (a plain `<a>`).
const Link = styled(RouterLink)(({ theme }) => ({
  color: theme.colour.primary.cssVar,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
}));

export default Link;
