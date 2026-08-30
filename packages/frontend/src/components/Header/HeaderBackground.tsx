import backgroundAvif from '@@frontend/assets/background.avif';
import backgroundFallback from '@@frontend/assets/background.jpg';
import backgroundJxl from '@@frontend/assets/background.jxl';
import backgroundWebp from '@@frontend/assets/background.webp';
import { theme } from '@@frontend/theme';
import { styled } from '@@frontend/utils';

const Layout = styled.div({
  position: 'absolute',

  height: 200,
  width: '100%',

  '&.is-home': {
    height: '100vh',
  },

  [theme.breakpoint.md.mediaUp()]: {
    height: 300,

    '&.currently-home': {
      height: '100vh',
    },
  },
});

const Image = styled.img({
  height: '100%',
  width: '100%',

  objectFit: 'cover',
  objectPosition: 'top right',
});

const HeaderBackground = (props: { headerKind: 'home' | 'default' }) => {
  const { headerKind } = props;

  return (
    <Layout className={headerKind === 'home' ? 'is-home' : undefined}>
      <picture>
        <source srcSet={backgroundJxl} type="image/jxl" />
        <source srcSet={backgroundAvif.src} type="image/avif" />
        <source srcSet={backgroundWebp.src} type="image/webp" />
        <Image src={backgroundFallback.src} />
      </picture>
    </Layout>
  );
};

export default HeaderBackground;
