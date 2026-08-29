import type { PropsWithChildren } from 'react';

import { H1, Main, MainContainer } from '@@frontend/components';
import ThemeProvider from '@@frontend/providers/theme';
import { styled } from '@@frontend/utils';

interface PageProps {
  title: string;
}

const Content = styled('article')({
  boxSizing: 'border-box',
  width: '100%',
});

const Page = (props: PropsWithChildren<PageProps>) => {
  const { children, title } = props;

  return (
    <ThemeProvider>
      <Main>
        <MainContainer>
          <H1>{title}</H1>
          <Content>{children}</Content>
        </MainContainer>
      </Main>
    </ThemeProvider>
  );
};

export default Page;
