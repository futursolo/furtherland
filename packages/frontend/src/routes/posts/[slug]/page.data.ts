import { data } from '@modern-js/runtime/router';

import { getPost } from '@@frontend/content/posts.server';

export const loader = async ({ params }: { params: { slug: string } }) => {
  const post = await getPost(params.slug);
  if (!post) {
    throw data('Not Found', { status: 404 });
  }
  return post;
};
