import { createFileRoute } from '@tanstack/react-router';

import { SITE_URL } from '@@frontend/constants/site';

const sitemapURL = new URL('sitemap-index.xml', SITE_URL);

const robotsTxt = `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () =>
        new Response(robotsTxt, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
    },
  },
});
