import { createFileRoute } from '@tanstack/react-router';

import { NotFound } from '@@frontend/components';
import formatTitle from '@@frontend/utils/formatTitle';

export const Route = createFileRoute('/404')({
  head: () => ({
    meta: [{ title: formatTitle('404 Not Found') }, { name: 'robots', content: 'noindex' }],
  }),
  component: NotFound,
});
