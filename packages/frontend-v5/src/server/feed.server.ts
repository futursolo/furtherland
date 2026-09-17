import { createElement } from 'react';

import { load } from 'cheerio';
import { generateAtomFeed } from 'feedsmith';
import type { Atom, DeepPartial } from 'feedsmith/types';
import { renderToStaticMarkup } from 'react-dom/server';

import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@@frontend-v5/constants/site';
import { getPostSummaries, type PostEntry } from '@@frontend-v5/content/posts';

const FEED_URL = `${SITE_URL}/atom.xml`;

// Strip a rendered post body down to plain text — the feed's sanitization step.
// v5 compiles MDX straight to React with no sanitization pass, so embedding the
// rendered HTML directly would let untrusted markup (a `<script>` tag, an
// `onerror=` handler, …) reach feed readers. Parse the markup with cheerio and drop
// `<script>`/`<style>`: taking the decoded text content removes every tag and
// resolves entities. Block and line boundaries are kept as newlines so the text
// stays readable, and any residual `<`, `>`, `&` a literal in the body reintroduced
// is dropped, so feedsmith serializes the result as escaped text (never a raw CDATA
// block a feed reader would execute).
const toPlainText = (html: string): string => {
  const $ = load(html);
  $('script, style').remove();
  $('br').replaceWith('\n');
  $('h1, h2, h3, h4, h5, h6, p, li, blockquote, pre, hr, tr, ul, ol').append('\n');
  return $.root()
    .text()
    .replace(/[<>&]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
};

// Render a post's compiled MDX component to a static string, then strip it to
// plain text (see `toPlainText`) for the feed `content` field. Uses default
// intrinsic elements (not the site's styled `mdxComponents`), so no theme
// provider is required. If a post's content can't be server-rendered (e.g. a
// client-only component), fall back to the post's description.
const renderPostContent = (post: PostEntry): string => {
  try {
    return toPlainText(renderToStaticMarkup(createElement(post.Content)));
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
export function buildAtomFeed(): string {
  const feed: DeepPartial<Atom.Feed<string>> = {
    id: FEED_URL,
    title: SITE_NAME,
    subtitle: SITE_DESCRIPTION,
    updated: new Date().toISOString(),
    links: [{ rel: 'alternate', href: SITE_URL }],
    authors: [{ name: AUTHOR_NAME, uri: SITE_URL }],
    entries: getPostSummaries().map(toEntry),
  };

  return generateAtomFeed<true>(feed);
}
