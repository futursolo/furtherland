import { createFileRoute } from '@tanstack/react-router';
import { SitemapStream, streamToPromise } from 'sitemap';

import { SITE_URL } from '@@frontend-v5/constants/site';
import { getSitemapItems } from '@@frontend-v5/content/sitemap';

// The first sitemap shard (`/sitemap-0.xml`) — the v5 equivalent of v4's
// `sitemap-0.xml`: a `<urlset>` listing every public page URL. It is referenced by
// the `sitemap-index.xml` index. Generated with the `sitemap` package (the same one v4's
// `@astrojs/sitemap` builds on) by streaming the URLs through a `SitemapStream` and
// collecting its output into the response body.
export const Route = createFileRoute('/sitemap-0.xml')({
  server: {
    handlers: {
      GET: async () => {
        const items = await getSitemapItems();
        const stream = new SitemapStream({ hostname: SITE_URL });
        const done = streamToPromise(stream);
        for (const item of items) stream.write(item);
        stream.end();
        const xml = (await done).toString('utf-8');
        return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
      },
    },
  },
});
