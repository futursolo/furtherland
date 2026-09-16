import { createFileRoute } from '@tanstack/react-router';

import { SITE_DESCRIPTION, SITE_URL } from '@@frontend-v5/constants/site';
import { getPostSummaries } from '@@frontend-v5/content/posts';
import Home from '@@frontend-v5/layouts/Home';
import formatTitle from '@@frontend-v5/utils/formatTitle';

// Home page — the v5 equivalent of v4's `pages/index.astro`: lists the posts
// (newest first, drafts hidden in production) using the v5 Home layout and the
// v5 `Main` / `MainContainer` / `H2` / `Author` / `Link` components.
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
  component: HomePage,
});

function HomePage() {
  const summaries = getPostSummaries();

  return <Home summaries={summaries} />;
}
