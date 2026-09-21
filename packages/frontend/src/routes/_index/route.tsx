import { useLoaderData } from 'react-router';

import { SITE_DESCRIPTION, SITE_URL } from '@@frontend/constants/site';
import { getDraftPostSummaries, getPostSummaries } from '@@frontend/content/posts.server';
import Home from '@@frontend/layouts/Home';
import formatTitle from '@@frontend/utils/formatTitle';
import { baseMeta } from '@@frontend/utils/meta';

import type { Route } from './+types/route';

export const loader = async () => {
  const summaries = [
    ...(import.meta.env.PROD ? [] : await getDraftPostSummaries()),
    ...(await getPostSummaries()),
  ];
  return { summaries };
};

export const meta = (): Route.MetaDescriptors => {
  return [
    ...baseMeta,
    { title: formatTitle('Home') },
    { name: 'description', content: SITE_DESCRIPTION },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: formatTitle('Home') },
    { property: 'og:description', content: SITE_DESCRIPTION },
    { property: 'og:url', content: `${SITE_URL}/` },
  ];
};

export const links: Route.LinksFunction = () => [{ rel: 'canonical', href: `${SITE_URL}/` }];

const HomePage = () => {
  const { summaries } = useLoaderData<typeof loader>();

  return <Home summaries={summaries} />;
};

export default HomePage;
