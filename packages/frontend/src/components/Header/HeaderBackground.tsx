import Background from '@@frontend/assets/background.jpg?multiview';
import { styled } from '@@frontend/utils';

const Layout = styled.div(({ theme }) => ({
  position: 'absolute',

  height: 200,
  width: '100%',

  '&.is-home': {
    height: '100vh',
  },

  // If touch device, this should be extended to cover the bottom bar.
  '@media (pointer: coarse)': {
    '&.is-home': {
      height: 'calc(100vh + 60px)',
    },
  },

  [theme.breakpoint.md.mediaUp()]: {
    height: 300,

    '&.is-home': {
      height: '100vh',
    },

    // If touch device, this should be extended to cover the bottom bar.
    '@media (pointer: coarse)': {
      '&.is-home': {
        height: 'calc(100vh + 60px)',
      },
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
      <Background ImgComponent={Image} />
    </Layout>
  );
};

export default HeaderBackground;
