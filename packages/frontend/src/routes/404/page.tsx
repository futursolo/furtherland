import { Helmet } from '@modern-js/runtime/head';

import NotFound from '@@frontend/components/NotFound';
import formatTitle from '@@frontend/utils/formatTitle';
import metaToTags from '@@frontend/utils/helmet';
import { baseMeta } from '@@frontend/utils/meta';

// Rendered at /404 so the SSG build can produce a 404.html; in development
// unknown URLs are handled by the root error boundary instead.
const NotFoundPage = () => (
  <>
    <Helmet>
      {metaToTags([
        ...baseMeta,
        { title: formatTitle('404 Not Found') },
        { name: 'robots', content: 'noindex' },
      ])}
    </Helmet>
    <NotFound />
  </>
);

export default NotFoundPage;
