import { SITE_URL } from '@@frontend/constants/site';

const sitemapURL = new URL('sitemap-index.xml', SITE_URL);

const robotsTxt = `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export async function loader() {
  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
