import { Body, Head, Html, Root, Scripts } from '@modern-js/runtime/document';

import ThemePreloadScript from '@@frontend/components/ThemePreloadScript';

const Document = () => (
  <Html lang="en" suppressHydrationWarning>
    <Head>
      <ThemePreloadScript />
    </Head>
    <Body>
      <Root />
      <Scripts />
    </Body>
  </Html>
);

export default Document;
