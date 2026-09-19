import { SitemapIndexStream, SitemapStream, streamToPromise } from 'sitemap';

import { SITE_URL } from '@@frontend/constants/site';
import { getSitemapItems } from '@@frontend/content/sitemap.server';

import type { Route } from './+types/sitemap-$chunk[.]xml';

const XML_CONTENT_TYPE = 'application/xml';

export async function loader({ params }: Route.LoaderArgs) {
  const { chunk } = params;

  if (chunk === 'index') {
    const stream = new SitemapIndexStream();
    const done = streamToPromise(stream);
    stream.write({ url: new URL('sitemap-0.xml', SITE_URL).href });
    stream.end();
    const xml = (await done).toString('utf-8');
    return new Response(xml, { headers: { 'Content-Type': XML_CONTENT_TYPE } });
  }

  if (chunk === '0') {
    const items = await getSitemapItems();
    const stream = new SitemapStream({ hostname: SITE_URL });
    const done = streamToPromise(stream);
    for (const item of items) stream.write(item);
    stream.end();
    const xml = (await done).toString('utf-8');
    return new Response(xml, { headers: { 'Content-Type': XML_CONTENT_TYPE } });
  }

  throw new Response(null, { status: 404, statusText: 'Not Found' });
}
