import { SITE_URL } from './src/constants/site';
import {
  homeMeta,
  notFoundMeta,
  pageMeta,
  postMeta,
  type MetaTag,
} from './src/utils/meta';
import type { Summary } from './site-xml';

/**
 * Node-only post-processing of the statically rendered pages' <head>.
 *
 * The framework captures the <head> (via react-helmet's module-level
 * `renderStatic()`) before the router's post-load state update has rendered
 * the route's <Helmet>, and react-helmet's server-side meta rendering is
 * broken in this stack — so the <head> in the rendered HTML is stale or
 * empty. The body is correct, so each static file's <head> is rebuilt here
 * from the same shared meta module the routes render with
 * (`src/utils/meta.ts`), guaranteeing parity with the per-page tags.
 *
 * Relative imports only (no `@@frontend` aliases): this module runs in the
 * CLI / build context, where aliases do not resolve.
 */

const escapeAttr = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderTags = (tags: MetaTag[]): string =>
  tags
    .map((tag) => {
      if ('title' in tag) return `<title>${escapeAttr(tag.title)}</title>`;
      if ('charSet' in tag) return `<meta charset="${escapeAttr(tag.charSet)}">`;
      if ('property' in tag)
        return `<meta property="${escapeAttr(tag.property)}" content="${escapeAttr(tag.content)}">`;
      if ('name' in tag)
        return `<meta name="${escapeAttr(tag.name)}" content="${escapeAttr(tag.content)}">`;
      return `<link rel="${escapeAttr(tag.rel)}" href="${escapeAttr(tag.href)}">`;
    })
    .join('\n    ');

// Stale <head> content left by the (broken / out-of-order) helmet capture:
// the template's charset / viewport and any helmet-rendered title / meta /
// canonical link. Stripping the template's charset / viewport is intentional
// — the app's baseMeta versions (matching the original site's head) are
// re-inserted with the fresh tags.
const STALE_PATTERNS: RegExp[] = [
  /<title\b[^>]*>[\s\S]*?<\/title>/gi,
  /<meta\s+charset=[^>]*>/gi,
  /<meta\s+(?:name|property)="viewport"[^>]*>/gi,
  /<meta\s+(?:name|property)="(?:description|robots|og:[a-z0-9_]+|article:[a-z0-9_]+)"[^>]*>/gi,
  /<link\b[^>]*\brel="canonical"[^>]*>/gi,
];

/**
 * Replace the stale <head> of a rendered page with the given fresh tags
 * (rendered before `</head>`).
 */
export const fixStaticHead = (html: string, tags: MetaTag[]): string => {
  let out = html;
  for (const pattern of STALE_PATTERNS) out = out.replace(pattern, '');
  return out.replace('</head>', `  ${renderTags(tags)}\n  </head>`);
};

/** The fresh <head> tags for a statically rendered route. */
export const staticMetaForRoute = (
  route: string,
  posts: Summary[],
  pages: Summary[],
): MetaTag[] => {
  if (route === '/') return homeMeta();
  if (route === '/404') return notFoundMeta();

  const postMatch = route.match(/^\/posts\/(.+)$/);
  if (postMatch) {
    const post = posts.find((p) => p.slug === postMatch[1]);
    return post ? postMeta(post, `${SITE_URL}${route}`) : notFoundMeta();
  }

  const pageMatch = route.match(/^\/pages\/(.+)$/);
  if (pageMatch) {
    const page = pages.find((p) => p.slug === pageMatch[1]);
    return page ? pageMeta(page, `${SITE_URL}${route}`) : notFoundMeta();
  }

  return notFoundMeta();
};
