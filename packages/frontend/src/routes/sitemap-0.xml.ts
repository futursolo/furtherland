import { SitemapStream, streamToPromise } from 'sitemap';

import { SITE_URL } from '@@frontend/constants/site';
import { getSitemapItems } from '@@frontend/content/sitemap';

export async function loader() {
  const items = await getSitemapItems();
  const stream = new SitemapStream({ hostname: SITE_URL });
  const done = streamToPromise(stream);
  for (const item of items) stream.write(item);
  stream.end();
  const xml = (await done).toString('utf-8');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
