import backgroundAvif from '@@frontend-v5/assets/background.avif';
import backgroundFallback from '@@frontend-v5/assets/background.jpg';
import backgroundJxl from '@@frontend-v5/assets/background.jxl';
import backgroundWebp from '@@frontend-v5/assets/background.webp';
import { styled } from '@@frontend-v5/utils';

const Layout = styled.div(({ theme }) => ({
  position: 'absolute',

  height: 200,
  width: '100%',

  '&.is-home': {
    height: '100vh',
  },

  [theme.breakpoint.md.mediaUp()]: {
    height: 300,

    '&.is-home': {
      height: '100vh',
    },
  },
}));

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
        <source srcSet={backgroundAvif} type="image/avif" />
        <source srcSet={backgroundWebp} type="image/webp" />
        <Image src={backgroundFallback} />
      </picture>
    </Layout>
  );
};

export default HeaderBackground;
