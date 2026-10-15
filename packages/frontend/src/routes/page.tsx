import { Helmet } from '@modern-js/runtime/head';
import { useLoaderData } from '@modern-js/runtime/router';

import { PostList } from '@@frontend/components';
import { SITE_DESCRIPTION, SITE_URL } from '@@frontend/constants/site';
import type { PostEntry } from '@@frontend/content/posts.server';
import formatTitle from '@@frontend/utils/formatTitle';
import metaToTags from '@@frontend/utils/helmet';
import { baseMeta } from '@@frontend/utils/meta';

type HomeLoaderData = { summaries: Omit<PostEntry, 'Content'>[] };

const HomePage = () => {
  const { summaries } = useLoaderData<HomeLoaderData>();

  return (
    <>
      <Helmet>
        {metaToTags([
          ...baseMeta,
          { title: formatTitle('Home') },
          { name: 'description', content: SITE_DESCRIPTION },
          { property: 'og:type', content: 'website' },
          { property: 'og:title', content: formatTitle('Home') },
          { property: 'og:description', content: SITE_DESCRIPTION },
          { property: 'og:url', content: `${SITE_URL}/` },
          { tagName: 'link', rel: 'canonical', href: `${SITE_URL}/` },
        ])}
      </Helmet>
      <PostList summaries={summaries} />
    </>
  );
};

export default HomePage;
