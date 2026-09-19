import { createFileRoute } from '@tanstack/react-router';

import { SITE_DESCRIPTION, SITE_URL } from '@@frontend/constants/site';
import { getPostSummaries } from '@@frontend/content/posts';
import Home from '@@frontend/layouts/Home';
import formatTitle from '@@frontend/utils/formatTitle';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: formatTitle('Home') },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: formatTitle('Home') },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:url', content: `${SITE_URL}/` },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/` }],
  }),
  loader: async () => {
    const summaries = await getPostSummaries();
    return { summaries: summaries };
  },
  component: HomePage,
});

function HomePage() {
  const { summaries } = Route.useLoaderData();

  return <Home summaries={summaries} />;
}
