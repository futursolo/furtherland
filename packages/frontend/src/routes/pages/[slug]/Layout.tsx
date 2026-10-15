import type { PropsWithChildren } from 'react';

import { Main, MainContainer } from '@@frontend/components';
import { H1 } from '@@frontend/elements';
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
    <Main>
      <MainContainer>
        <H1>{title}</H1>
        <Content>{children}</Content>
      </MainContainer>
    </Main>
  );
};

export default Page;
