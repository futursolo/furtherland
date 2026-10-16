import { Helmet } from '@modern-js/runtime/head';

import NotFound from '@@frontend/components/NotFound';
import metaToTags from '@@frontend/utils/helmet';
import { notFoundMeta } from '@@frontend/utils/meta';

// Rendered at /404 so the SSG build can produce a 404.html; in development
// unknown URLs are handled by the root error boundary instead.
const NotFoundPage = () => (
  <>
    <Helmet>{metaToTags(notFoundMeta())}</Helmet>
    <NotFound />
  </>
);

export default NotFoundPage;
