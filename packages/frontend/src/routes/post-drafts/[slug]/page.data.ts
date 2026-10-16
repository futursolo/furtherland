import { data } from '@modern-js/runtime/router';

import { getDraftPost } from '@@frontend/content/posts-drafts.server';

export const loader = async ({ params }: { params: { slug: string } }) => {
  if (import.meta.env.PROD) {
    throw data('Not Found', { status: 404 });
  }
  const post = await getDraftPost(params.slug);
  if (!post) {
    throw data('Not Found', { status: 404 });
  }
  return post;
};
