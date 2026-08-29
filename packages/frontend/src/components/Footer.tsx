import { SITE_NAME } from '@@frontend/constants/site';
import { theme } from '@@frontend/providers/theme';
import { styled } from '@@frontend/utils';

import Box from './Box';

const FoooterContainer = styled.footer({
  height: 100,
  width: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',

  boxSizing: 'border-box',

  paddingLeft: 'max(20px, env(safe-area-inset-left))',
  paddingRight: 'max(20px, env(safe-area-inset-right))',
});

const FooterLayout = styled(Box)({
  maxWidth: `calc(${theme.breakpoint.md.asPx()} - 40px)`,
  width: theme.breakpoint.md.width,

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  [theme.breakpoint.md.mediaDown()]: {
    flexDirection: 'column',
  },
});
const Title = styled.div({});
const Copy = styled.div({
  color: theme.fontColour.secondary.cssVar,
  transition: 'color 0.2s',
});

const Footer = () => {
  return (
    <FoooterContainer>
      <FooterLayout>
        <Title>&copy; 2026 {SITE_NAME}</Title>
        <Copy>
          All articles on this site are licensed under the CC-BY-SA 4.0 International Licence.
        </Copy>
      </FooterLayout>
    </FoooterContainer>
  );
};

export default Footer;
