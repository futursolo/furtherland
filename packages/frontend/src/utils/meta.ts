import type { MetaDescriptor } from '@modern-js/runtime/router';

import { SITE_NAME } from '@@frontend/constants/site';

/**
 * Site-wide meta tags that must appear on every page.
 *
 * React Helmet only adds/merges the tags of the rendered <Helmet>, so each
 * route re-includes this base to keep the global tags (charset, viewport,
 * og:site_name) on its page.
 */
export const baseMeta: MetaDescriptor[] = [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1.0,viewport-fit=cover' },
  { property: 'og:site_name', content: SITE_NAME },
];
