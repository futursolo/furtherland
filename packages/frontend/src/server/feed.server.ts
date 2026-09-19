import { createElement } from 'react';

import { load } from 'cheerio';
import { generateAtomFeed } from 'feedsmith';
import type { Atom, DeepPartial } from 'feedsmith/types';
import { renderToStaticMarkup } from 'react-dom/server';

import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@@frontend/constants/site';
import { getPostSummaries, type PostEntry } from '@@frontend/content/posts';
import type { MdxModule } from '@@frontend/content/types';

const FEED_URL = `${SITE_URL}/atom.xml`;

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

const renderPostContent = async (post: PostEntry): Promise<string> => {
  try {
    const { default: Content }: MdxModule = await import(
      `@@contents/posts/${post.date}/${post.slug}.mdx`
    );
    return toPlainText(renderToStaticMarkup(createElement(Content)));
  } catch {
    return post.description ?? '';
  }
};

const toEntry = async (post: PostEntry): Promise<Atom.Entry<string>> => {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const isoDate = new Date(post.date).toISOString();

  return {
    id: url,
    title: post.title,
    published: isoDate,
    updated: isoDate,
    ...(post.description ? { summary: post.description } : {}),
    content: await renderPostContent(post),
    links: [{ rel: 'alternate', href: url }],
    authors: [{ name: AUTHOR_NAME }],
  };
};

export async function buildAtomFeed(): Promise<string> {
  const feed: DeepPartial<Atom.Feed<string>> = {
    id: FEED_URL,
    title: SITE_NAME,
    subtitle: SITE_DESCRIPTION,
    updated: new Date().toISOString(),
    links: [{ rel: 'alternate', href: SITE_URL }],
    authors: [{ name: AUTHOR_NAME, uri: SITE_URL }],
    entries: await Promise.all((await getPostSummaries()).map(toEntry)),
  };

  return generateAtomFeed<true>(feed);
}
