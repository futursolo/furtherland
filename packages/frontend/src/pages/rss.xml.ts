import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@@frontend/constants/site';

import { type CollectionEntry, getCollection } from 'astro:content';

const markdownParser = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
});

// Render a post's markdown body to sanitized HTML for the RSS `content` field.
const renderPostContent = (body: string) =>
  sanitizeHtml(markdownParser.render(body), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  });

export async function GET({ site }: APIContext) {
  const posts = await getCollection(
    'posts',
    (post: CollectionEntry<'posts'>) => !post.data.isDraft,
  );

  // Newest first (ISO dates sort lexicographically), then emit a Date for each item.
  const sortedPosts = [...posts].sort((a, b) => (a.data.date < b.data.date ? 1 : -1));

  const items = sortedPosts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: new Date(post.data.date),
    link: `/posts/${post.data.slug}`,
    content: renderPostContent(post.body ?? ''),
  }));

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: site ?? new URL(SITE_URL),
    trailingSlash: false,
    customData: '<language>en</language>',
    items,
  });
}
