import type { MdxComponent } from '@@frontend/content/types';
import { mdxComponents } from '@@frontend/elements';
import { styled } from '@@frontend/utils';

import Box from './Box';

interface MdxRendererProps {
  Content: MdxComponent;
}

const Layout = styled(Box)({
  lineHeight: '2rem',
});

const MdxRenderer = (props: MdxRendererProps) => {
  const { Content } = props;

  return (
    <Layout>
      <Content components={mdxComponents} />
    </Layout>
  );
};

export default MdxRenderer;
