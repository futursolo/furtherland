import { Helmet } from '@modern-js/runtime/head';
import { useLoaderData } from '@modern-js/runtime/router';

import { SITE_URL } from '@@frontend/constants/site';
import type { PostEntry } from '@@frontend/content/posts.server';
import metaToTags from '@@frontend/utils/helmet';

import { type CreateContentPromiseFn, createMeta, RouteComponent } from './common';

const createContentPromise: CreateContentPromiseFn = ({ date, slug }) =>
  import(`@@contents/posts/${date}/${slug}.mdx`);

const PostRoute = () => {
  const post = useLoaderData<PostEntry>();
  const url = `${SITE_URL}/posts/${post.slug}`;

  return (
    <>
      <Helmet>{metaToTags(createMeta({ loaderData: post, url }))}</Helmet>
      <RouteComponent loaderData={post} createContentPromise={createContentPromise} />
    </>
  );
};

export default PostRoute;
