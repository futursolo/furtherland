import { Helmet } from '@modern-js/runtime/head';
import { useLoaderData } from '@modern-js/runtime/router';

import { PostList } from '@@frontend/components';
import type { PostEntry } from '@@frontend/content/posts.server';
import metaToTags from '@@frontend/utils/helmet';
import { homeMeta } from '@@frontend/utils/meta';

type HomeLoaderData = { summaries: Omit<PostEntry, 'Content'>[] };

const HomePage = () => {
  const { summaries } = useLoaderData<HomeLoaderData>();

  return (
    <>
      <Helmet>{metaToTags(homeMeta())}</Helmet>
      <PostList summaries={summaries} />
    </>
  );
};

export default HomePage;
