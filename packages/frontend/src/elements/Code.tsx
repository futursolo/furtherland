import { styled } from '@@frontend/utils';

const Code = styled('code')(({ theme }) => ({
  backgroundColor: `${theme.colour.background.code.cssVar} !important`,
  padding: '0.2rem 0.4rem',
  borderRadius: 2,
  lineHeight: '1.5rem',

  transition: 'background-color 0.3s, color 0.3s',
}));

export default Code;
