import { SITE_URL } from '@@frontend/constants/site';

import { getPageSummaries } from './pages.server';
import { getPostSummaries } from './posts.server';

/** A single sitemap entry: a public page URL. */
export type SitemapItem = {
  url: string;
};

export async function getSitemapItems(): Promise<SitemapItem[]> {
  const items: SitemapItem[] = [{ url: `${SITE_URL}/` }];

  for (const page of await getPageSummaries()) {
    if (page.isDraft) continue;
    items.push({ url: `${SITE_URL}/pages/${page.slug}` });
  }

  for (const post of await getPostSummaries()) {
    if (post.isDraft) continue;
    items.push({ url: `${SITE_URL}/posts/${post.slug}` });
  }

  return items.sort((a, b) => (a.url === b.url ? 0 : a.url < b.url ? -1 : 1));
}
