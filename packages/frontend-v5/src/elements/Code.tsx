import { styled } from '@@frontend-v5/utils';

const Code = styled('code')(({ theme }) => ({
  backgroundColor: `${theme.colour.background.code.cssVar} !important`,
  padding: '0.2rem 0.4rem',
  borderRadius: 2,
}));

export default Code;
