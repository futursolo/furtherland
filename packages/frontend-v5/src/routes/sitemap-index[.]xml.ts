import { createFileRoute } from '@tanstack/react-router';
import { SitemapIndexStream, streamToPromise } from 'sitemap';

import { SITE_URL } from '@@frontend-v5/constants/site';
import { getLatestLastmod, getSitemapItems } from '@@frontend-v5/content/sitemap';

const shardUrl = new URL('sitemap-0.xml', SITE_URL).href;

export const Route = createFileRoute('/sitemap-index.xml')({
  server: {
    handlers: {
      GET: async () => {
        const items = await getSitemapItems();
        const stream = new SitemapIndexStream();
        const done = streamToPromise(stream);
        stream.write({ url: shardUrl, lastmod: getLatestLastmod(items) });
        stream.end();
        const xml = (await done).toString('utf-8');
        return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
      },
    },
  },
});
