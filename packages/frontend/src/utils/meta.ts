import { SITE_NAME } from '@@frontend/constants/site';

/**
 * Site-wide meta tags that must appear on every page.
 *
 * React Router renders the `<meta>` tags of the *deepest* matched route (a route
 * with its own `meta` replaces, rather than merges, its ancestors'), so each route
 * re-includes this base to keep the global tags (charset, viewport, og:site_name).
 */
export const baseMeta = [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1.0,viewport-fit=cover' },
  { property: 'og:site_name', content: SITE_NAME },
];
