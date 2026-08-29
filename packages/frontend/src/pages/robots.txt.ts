import type { APIContext } from 'astro';

const getRobotsTxt = (sitemapURL: URL) =>
  `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET = ({ site }: APIContext) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return new Response(getRobotsTxt(sitemapURL), {
    headers: { 'Content-Type': 'text/plain' },
  });
};
