import { SITE_URL } from '@@frontend-v5/constants/site';

import { getPageSummaries } from './pages';
import { getPostSummaries } from './posts';

/** A single sitemap entry: a public page URL and (for posts) its last-modified date. */
export type SitemapItem = {
  url: string;
  lastmod?: string;
};

/**
 * Every public URL the site serves: the home page, each published page, and each
 * published (non-draft) post. Drafts are always excluded — a sitemap is a production
 * artifact, so it should never advertise unpublished content. Each post carries a
 * `lastmod` derived from its date, mirroring v4's `@astrojs/sitemap` `serialize`
 * hook. The result is sorted by URL, matching v4's output ordering.
 */
export async function getSitemapItems(): Promise<SitemapItem[]> {
  const items: SitemapItem[] = [{ url: `${SITE_URL}/` }];

  for (const page of await getPageSummaries()) {
    if (page.isDraft) continue;
    items.push({ url: `${SITE_URL}/pages/${page.slug}` });
  }

  for (const post of await getPostSummaries()) {
    if (post.isDraft) continue;
    items.push({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastmod: new Date(post.date).toISOString(),
    });
  }

  return items.sort((a, b) => (a.url === b.url ? 0 : a.url < b.url ? -1 : 1));
}

/**
 * The latest `lastmod` across the given items (ISO string), or `undefined` when none
 * of them have one. Mirrors v4's `@astrojs/sitemap` `getLatestLastmod` — the sitemap
 * index stamps each shard with the newest modification time contained in it.
 */
export function getLatestLastmod(items: SitemapItem[]): string | undefined {
  let latest: number | undefined;
  for (const item of items) {
    if (!item.lastmod) continue;
    const time = new Date(item.lastmod).getTime();
    if (Number.isNaN(time)) continue;
    if (latest === undefined || time > latest) latest = time;
  }
  return latest === undefined ? undefined : new Date(latest).toISOString();
}
