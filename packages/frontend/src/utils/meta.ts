import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../constants/site';
import formatTitle from './formatTitle';

/**
 * The meta tags a page's <head> can carry, as plain descriptors shared by the
 * React <Helmet> rendering (see `helmet.tsx`) and the static build's head
 * post-processing (`site-head.ts`).
 *
 * Relative imports only (no `@@frontend` aliases) so the module can also be
 * loaded from the Node-only build context, where aliases do not resolve.
 */
export type MetaTag =
  | { title: string }
  | { charSet: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { tagName: 'link'; rel: string; href: string };

interface MetaEntry {
  title: string;
  date?: string;
  description?: string;
}

/**
 * Site-wide meta tags that must appear on every page.
 *
 * React Helmet only adds/merges the tags of the rendered <Helmet>, so each
 * route re-includes this base to keep the global tags (charset, viewport,
 * og:site_name) on its page.
 */
export const baseMeta: MetaTag[] = [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1.0,viewport-fit=cover' },
  { property: 'og:site_name', content: SITE_NAME },
];

export const homeMeta = (): MetaTag[] => [
  ...baseMeta,
  { title: formatTitle('Home') },
  { name: 'description', content: SITE_DESCRIPTION },
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: formatTitle('Home') },
  { property: 'og:description', content: SITE_DESCRIPTION },
  { property: 'og:url', content: `${SITE_URL}/` },
  { tagName: 'link', rel: 'canonical', href: `${SITE_URL}/` },
];

export const notFoundMeta = (): MetaTag[] => [
  ...baseMeta,
  { title: formatTitle('404 Not Found') },
  { name: 'robots', content: 'noindex' },
];

export const postMeta = (entry: MetaEntry, url: string): MetaTag[] => [
  ...baseMeta,
  { title: formatTitle(entry.title) },
  ...(entry.description ? [{ name: 'description', content: entry.description }] : []),
  { property: 'og:type', content: 'article' },
  { property: 'og:title', content: formatTitle(entry.title) },
  ...(entry.description ? [{ property: 'og:description', content: entry.description }] : []),
  { property: 'og:url', content: url },
  { property: 'article:published_time', content: new Date(entry.date ?? '').toISOString() },
  { property: 'article:author', content: AUTHOR_NAME },
  { tagName: 'link', rel: 'canonical', href: url },
];

export const pageMeta = (entry: MetaEntry, url: string): MetaTag[] => [
  ...baseMeta,
  { title: formatTitle(entry.title) },
  ...(entry.description ? [{ name: 'description', content: entry.description }] : []),
  { property: 'og:type', content: 'website' },
  { property: 'og:title', content: formatTitle(entry.title) },
  ...(entry.description ? [{ property: 'og:description', content: entry.description }] : []),
  { property: 'og:url', content: url },
  { tagName: 'link', rel: 'canonical', href: url },
];
