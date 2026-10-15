import { data } from '@modern-js/runtime/router';

import { getDraftPage } from '@@frontend/content/pages.server';

export const loader = async ({ params }: { params: { slug: string } }) => {
  if (import.meta.env.PROD) {
    throw data('Not Found', { status: 404 });
  }
  const page = await getDraftPage(params.slug);
  if (!page) {
    throw data('Not Found', { status: 404 });
  }
  return page;
};
