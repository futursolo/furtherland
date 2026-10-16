import { defineRoutes } from '@modern-js/runtime/config-routes';

// Set by `modern.config.ts` from the `command` param. `process.env.NODE_ENV`
// is `production` for both `modern dev` and `modern build`, so it cannot be
// used here to tell the two apart.
const isProd = process.env.FL_IS_PROD === '1';

// Draft routes are only reachable in development: in production they are
// dropped from the route tree so draft code never lands in the client bundle.
const DRAFT_SEGMENTS = ['post-drafts', 'page-drafts'];

// The detected route tree is flattened by the framework: each top-level
// route's `path` is the full relative path (e.g. `post-drafts/:slug`), so
// match on the first path segment.
const isDraft = (path: string | undefined): boolean =>
  path !== undefined &&
  DRAFT_SEGMENTS.some((segment) => path === segment || path.startsWith(`${segment}/`));

// The XML / text endpoints (atom feed, robots.txt, sitemaps) are NOT page
// routes: the framework renders every page route to HTML. They are served
// verbatim instead — by a dev-server middleware in development and as static
// files (emitted by the `staticSite` post-build step) in production.
export default defineRoutes((_routeFunctions, fileRoutes) =>
  fileRoutes.map((route) => ({
    ...route,
    children: [...(route.children ?? [])].filter((child) => !isProd || !isDraft(child.path)),
  })),
);
