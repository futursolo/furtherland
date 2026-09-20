import { SitemapIndexStream, streamToPromise } from 'sitemap';

import { SITE_URL } from '@@frontend/constants/site';

const XML_CONTENT_TYPE = 'application/xml';

export const loader = async () => {
  const stream = new SitemapIndexStream();
  const done = streamToPromise(stream);
  stream.write({ url: new URL('sitemap-0.xml', SITE_URL).href });
  stream.end();
  const xml = (await done).toString('utf-8');
  return new Response(xml, { headers: { 'Content-Type': XML_CONTENT_TYPE } });
};
