import { styled } from '@@frontend/utils';

import Box from './Box';
import Skeleton from './Skeleton';

const Layout = styled(Box)({
  paddingBottom: '1rem',
});

const ContentSkeleton = () => (
  <>
    <Layout>
      <Skeleton height="1rem" width="100%" />
    </Layout>
    <Layout>
      <Skeleton height="1rem" width="100%" />
    </Layout>
    <Layout>
      <Skeleton height="150px" width="100%" />
    </Layout>
  </>
);

export default ContentSkeleton;
