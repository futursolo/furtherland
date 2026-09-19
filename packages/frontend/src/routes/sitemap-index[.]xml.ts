import { createFileRoute } from '@tanstack/react-router';
import { SitemapIndexStream, streamToPromise } from 'sitemap';

import { SITE_URL } from '@@frontend/constants/site';

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
