import type { TableHTMLAttributes } from 'react';

import { styled } from '@@frontend/utils';

const Wrapper = styled.div(({ theme }) => ({
  width: '100%',
  margin: '1.5rem 0',
  overflowX: 'auto',
  border: '1px solid rgb(206, 211, 219)',
  borderRadius: 4,
  boxSizing: 'border-box',
  backgroundColor: theme.colour.background.component.cssVar,

  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem',
    color: theme.fontColour.primary.cssVar,
  },

  '& thead': {
    backgroundColor: 'rgb(242, 245, 255)',
  },

  '& th': {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: 600,
    color: theme.fontColour.primary.cssVar,
    borderBottom: '2px solid rgb(206, 211, 219)',
  },

  '& td': {
    padding: '0.6rem 1rem',
    lineHeight: 1.6,
    color: theme.fontColour.primary.cssVar,
    borderBottom: '1px solid rgb(206, 211, 219)',
  },

  'html[data-theme=dark] &': {
    borderColor: 'rgb(57, 63, 78)',
    backgroundColor: 'rgb(51, 53, 62)',
  },

  'html[data-theme=dark] & thead': {
    backgroundColor: 'rgb(57, 63, 78)',
  },

  'html[data-theme=dark] & th': {
    borderBottom: '2px solid rgb(57, 63, 78)',
  },

  'html[data-theme=dark] & td': {
    borderBottom: '1px solid rgb(57, 63, 78)',
  },
}));

const Table = (props: TableHTMLAttributes<HTMLTableElement>) => {
  const { children, ...rest } = props;

  return (
    <Wrapper>
      <table {...rest}>{children}</table>
    </Wrapper>
  );
};

export default Table;
