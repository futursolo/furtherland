import { createFileRoute } from '@tanstack/react-router';
import { SitemapIndexStream, streamToPromise } from 'sitemap';

import { SITE_URL } from '@@frontend-v5/constants/site';

// The sitemap index (`/sitemap-index.xml`) — the v5 equivalent of v4's
// `sitemap-index.xml`. It is a `<sitemapindex>` that points at the URL-set shards
// (`/sitemap-0.xml`, …); both `/robots.txt` and the root `<link rel="sitemap">`
// reference it. Generated with the `sitemap` package by streaming the single
// shard's entry through a `SitemapIndexStream`.
const shardUrl = new URL('sitemap-0.xml', SITE_URL).href;

export const Route = createFileRoute('/sitemap-index.xml')({
  server: {
    handlers: {
      GET: async () => {
        const stream = new SitemapIndexStream();
        const done = streamToPromise(stream);
        stream.write({ url: shardUrl });
        stream.end();
        const xml = (await done).toString('utf-8');
        return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
      },
    },
  },
});
