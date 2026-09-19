import { NotFound } from '@@frontend/components';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import type { Route } from './+types/route';

export function meta(): Route.MetaDescriptors {
  return [
    ...baseMeta,
    { title: formatTitle('404 Not Found') },
    { name: 'robots', content: 'noindex' },
  ];
}

export default function NotFoundPage() {
  return <NotFound />;
}
