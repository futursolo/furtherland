import { createElement } from 'react';

import { generateAtomFeed } from 'feedsmith';
import type { Atom, DeepPartial } from 'feedsmith/types';
import { renderToStaticMarkup } from 'react-dom/server';

import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@@frontend-v5/constants/site';
import { getPostSummaries, type PostEntry } from '@@frontend-v5/content/posts';

const FEED_URL = `${SITE_URL}/atom.xml`;

// Render a post's compiled MDX component to a self-contained static HTML string
// for the feed `content` field. Uses default intrinsic elements (not the site's
// styled `mdxComponents`), so no theme provider is required — feed readers apply
// their own styling. If a post's content can't be server-rendered (e.g. a
// client-only component), fall back to the post's description.
const renderPostContent = (post: PostEntry): string => {
  try {
    return renderToStaticMarkup(createElement(post.Content));
  } catch {
    return post.description ?? '';
  }
};

// One Atom `<entry>` per post. The entry `id` is the post's canonical URL (stable
// + unique); `updated`/`published` are the post's date; `summary` is the
// frontmatter description; `content` is the rendered body.
const toEntry = (post: PostEntry): Atom.Entry<string> => {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const isoDate = new Date(post.date).toISOString();

  return {
    id: url,
    title: post.title,
    published: isoDate,
    updated: isoDate,
    ...(post.description ? { summary: post.description } : {}),
    content: renderPostContent(post),
    links: [{ rel: 'alternate', href: url }],
    authors: [{ name: AUTHOR_NAME }],
  };
};

/**
 * Build the site's Atom feed (via feedsmith). Mirrors v4's RSS feed: drafts are
 * excluded in production (see `getPostSummaries`), entries are newest first, and
 * each entry carries the post's rendered body.
 */
export async function buildAtomFeed(): Promise<string> {
  const feed: DeepPartial<Atom.Feed<string>> = {
    id: FEED_URL,
    title: SITE_NAME,
    subtitle: SITE_DESCRIPTION,
    updated: new Date().toISOString(),
    links: [{ rel: 'alternate', href: SITE_URL }],
    authors: [{ name: AUTHOR_NAME, uri: SITE_URL }],
    entries: (await getPostSummaries()).map(toEntry),
  };

  return generateAtomFeed<true>(feed);
}
