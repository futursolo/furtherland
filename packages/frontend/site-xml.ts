import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import type { AtomFeed } from 'feedsmith';
import { generateAtomFeed } from 'feedsmith';
import { parse as parseYaml } from 'yaml';
import { SitemapIndexStream, SitemapStream, streamToPromise } from 'sitemap';

import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './src/constants/site';

/**
 * Node-only generation of the site's XML / text endpoints (atom feed,
 * robots.txt, sitemaps). Unlike `src/content/*.server.ts` (which rely on
 * `import.meta.glob` and therefore only run inside the Rsbuild-compiled SSR
 * bundle), this module reads MDX frontmatter straight from disk so it can run
 * in the CLI / dev-server / build context, where the framework config and the
 * `finalizeBuild` post-build step live.
 *
 * Atom feed entries carry the post `description` as their content (a
 * description is always present in frontmatter); the full MDX body is only
 * available through the Rsbuild MDX pipeline.
 */

type Summary = {
  slug: string;
  title: string;
  date?: string;
  description?: string;
};

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const readSummary = (file: string, fallbackDate?: string): Summary | null => {
  const raw = readFileSync(file, 'utf-8');
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return null;
  const data = parseYaml(match[1]) as Record<string, unknown>;
  const slug = asString(data.slug);
  if (!slug) return null;
  return {
    slug,
    title: asString(data.title) ?? slug,
    date: asString(data.date) ?? fallbackDate,
    description: asString(data.description),
  };
};

const collectPosts = (contentsRoot: string): Summary[] => {
  const postsDir = path.join(contentsRoot, 'posts');
  if (!existsSync(postsDir)) return [];
  const out: Summary[] = [];
  for (const date of readdirSync(postsDir)) {
    const dateDir = path.join(postsDir, date);
    if (!statSync(dateDir).isDirectory()) continue;
    for (const file of readdirSync(dateDir)) {
      if (!file.endsWith('.mdx')) continue;
      const summary = readSummary(path.join(dateDir, file), date);
      if (summary) out.push(summary);
    }
  }
  return out.sort((a, b) => (a.date === b.date ? 0 : a.date! < b.date! ? 1 : -1));
};

const collectPages = (contentsRoot: string): Summary[] => {
  const pagesDir = path.join(contentsRoot, 'pages');
  if (!existsSync(pagesDir)) return [];
  const out: Summary[] = [];
  for (const file of readdirSync(pagesDir)) {
    if (!file.endsWith('.mdx')) continue;
    const summary = readSummary(path.join(pagesDir, file));
    if (summary) out.push(summary);
  }
  return out;
};

export const buildRobotsTxt = (): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', SITE_URL).href}\n`;

const sitemapItems = (posts: Summary[], pages: Summary[]): Array<{ url: string }> => {
  const items: Array<{ url: string }> = [{ url: `${SITE_URL}/` }];
  for (const page of pages) items.push({ url: `${SITE_URL}/pages/${page.slug}` });
  for (const post of posts) items.push({ url: `${SITE_URL}/posts/${post.slug}` });
  return items.sort((a, b) => (a.url === b.url ? 0 : a.url < b.url ? -1 : 1));
};

export const buildSitemap0Xml = async (
  posts: Summary[],
  pages: Summary[],
): Promise<string> => {
  const stream = new SitemapStream({ hostname: SITE_URL });
  const done = streamToPromise(stream);
  for (const item of sitemapItems(posts, pages)) stream.write(item);
  stream.end();
  return (await done).toString('utf-8');
};

export const buildSitemapIndexXml = async (): Promise<string> => {
  const stream = new SitemapIndexStream();
  const done = streamToPromise(stream);
  stream.write({ url: new URL('sitemap-0.xml', SITE_URL).href });
  stream.end();
  return (await done).toString('utf-8');
};

const FEED_URL = `${SITE_URL}/atom.xml`;

const toEntry = (post: Summary): AtomFeed.Entry<string> => {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const isoDate = new Date(post.date ?? '').toISOString();
  return {
    id: url,
    title: { value: post.title },
    published: isoDate,
    updated: isoDate,
    ...(post.description ? { summary: { value: post.description } } : {}),
    content: { value: post.description ?? '' },
    links: [{ rel: 'alternate', href: url }],
    authors: [{ name: AUTHOR_NAME }],
  };
};

export const buildAtomFeed = async (posts: Summary[]): Promise<string> => {
  const feed: AtomFeed.Feed<string> = {
    id: FEED_URL,
    title: { value: SITE_NAME },
    subtitle: { value: SITE_DESCRIPTION },
    updated: new Date().toISOString(),
    links: [{ rel: 'alternate', href: SITE_URL }],
    authors: [{ name: AUTHOR_NAME, uri: SITE_URL }],
    entries: posts.map(toEntry),
  };
  return generateAtomFeed(feed);
};

export type XmlDocument = { path: string; type: string; body: Promise<string> | string };

/** The four XML / text endpoints, in the order they should be served / emitted. */
export const buildSiteXml = (
  contentsRoot: string,
): Promise<Array<{ file: string; contentType: string; body: string }>> => {
  const posts = collectPosts(contentsRoot);
  const pages = collectPages(contentsRoot);
  return Promise.all([
    Promise.resolve(buildRobotsTxt()).then((body) => ({
      file: 'robots.txt',
      contentType: 'text/plain; charset=utf-8',
      body,
    })),
    Promise.resolve(buildAtomFeed(posts)).then((body) => ({
      file: 'atom.xml',
      contentType: 'application/atom+xml; charset=utf-8',
      body,
    })),
    buildSitemapIndexXml().then((body) => ({
      file: 'sitemap-index.xml',
      contentType: 'application/xml; charset=utf-8',
      body,
    })),
    buildSitemap0Xml(posts, pages).then((body) => ({
      file: 'sitemap-0.xml',
      contentType: 'application/xml; charset=utf-8',
      body,
    })),
  ]);
};
