import { styled } from '@@frontend/utils';

const OrderedList = styled('ol')({
  margin: '0.5rem',

  // Nested lists: shrink the default 2.5rem left padding down to 1rem.
  'ol &, ul &': {
    paddingLeft: '1rem',
  },
});

export default OrderedList;
