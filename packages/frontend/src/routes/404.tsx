import { createFileRoute } from '@tanstack/react-router';

import { NotFound } from '@@frontend/components';
import formatTitle from '@@frontend/utils/formatTitle';

// Dedicated `/404` route. As with every other route it renders inside the root
// `RootShell`, so the site chrome (Header + Footer) is supplied there and this
// route only renders the shared `NotFound` content. The `noindex` robots meta +
// `404 Not Found` title keep it out of search indexes.
export const Route = createFileRoute('/404')({
  head: () => ({
    meta: [{ title: formatTitle('404 Not Found') }, { name: 'robots', content: 'noindex' }],
  }),
  component: NotFound,
});
