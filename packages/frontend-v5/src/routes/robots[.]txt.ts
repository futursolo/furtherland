import { createFileRoute } from '@tanstack/react-router';

import { SITE_URL } from '@@frontend-v5/constants/site';

// The `Sitemap:` line must point at the v5 sitemap route (todo/007-restore-sitemap) —
// a route that emits `sitemap.xml`. Keep this path in sync with that route's URL.
const sitemapURL = new URL('sitemap.xml', SITE_URL);

// The v5 equivalent of v4's `pages/robots.txt.ts`. v4 served this via a GET
// route/handler too; here it is a TanStack Start *server route* (the `server`
// property on the route). Its GET handler returns the raw `text/plain` body
// directly, so no HTML document shell is wrapped around it.
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
