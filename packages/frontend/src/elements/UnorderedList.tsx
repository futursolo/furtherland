import { styled } from '@@frontend/utils';

const UnorderedList = styled('ul')({
  margin: '0.5rem',

  // Nested lists: shrink the default 2.5rem left padding down to 1rem.
  'ol &, ul &': {
    paddingLeft: '1rem',
  },
});

export default UnorderedList;
