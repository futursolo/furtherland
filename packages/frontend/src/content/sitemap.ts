import { SITE_URL } from '@@frontend/constants/site';

import { getPageSummaries } from './pages';
import { getPostSummaries } from './posts';

/** A single sitemap entry: a public page URL. */
export type SitemapItem = {
  url: string;
};

/**
 * Every public URL the site serves: the home page, each published page, and each
 * published (non-draft) post. Drafts are always excluded — a sitemap is a production
 * artifact, so it should never advertise unpublished content. The result is sorted by
 * URL, matching v4's output ordering.
 */
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
