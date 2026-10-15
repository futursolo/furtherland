import { data } from '@modern-js/runtime/router';

import { getPage } from '@@frontend/content/pages.server';

export const loader = async ({ params }: { params: { slug: string } }) => {
  const page = await getPage(params.slug);
  if (!page) {
    throw data('Not Found', { status: 404 });
  }
  return page;
};
