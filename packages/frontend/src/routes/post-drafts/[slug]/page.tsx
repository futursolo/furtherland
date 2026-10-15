import { Helmet } from '@modern-js/runtime/head';
import { useLoaderData } from '@modern-js/runtime/router';

import { SITE_URL } from '@@frontend/constants/site';
import type { PostEntry } from '@@frontend/content/posts.server';
import metaToTags from '@@frontend/utils/helmet';

import { type CreateContentPromiseFn, createMeta, RouteComponent } from '../../posts/[slug]/common';

const createContentPromise: CreateContentPromiseFn = ({ date, slug }) =>
  import(`@@contents/post-drafts/${date}/${slug}.mdx`);

const PostDraftRoute = () => {
  const post = useLoaderData<PostEntry>();
  const url = `${SITE_URL}/post-drafts/${post.slug}`;

  return (
    <>
      <Helmet>
        {metaToTags([
          ...createMeta({ loaderData: post, url }),
          { name: 'robots', content: 'noindex' },
        ])}
      </Helmet>
      <RouteComponent loaderData={post} createContentPromise={createContentPromise} />
    </>
  );
};

export default PostDraftRoute;
