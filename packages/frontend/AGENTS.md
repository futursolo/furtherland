# AGENTS.md

Guidance for AI coding agents working in `@furtherland/frontend`.

## What this is

The **frontend** (`@furtherland/frontend`) — the furtherland blog on **Modern.js v3**
(`@modern-js/app-tools`, Rsbuild/Rspack-based, SSR) + **React 19**. It is a workspace in this Yarn
4 monorepo (`nodeLinker: node-modules`). Styling is Emotion-based: a `theme` object in
`src/providers/theme.tsx` is consumed by the `ThemeProvider` and by `styled`/`sx` (from
`@@frontend/utils`), and global CSS (the `--fl-theme-*` custom properties plus base `html, body`
rules) is injected by the provider's Emotion `<Global>`.

## Commands

Run from `packages/frontend/` via `yarn`. There is **no test suite**; Biome is the verification
gate.

| Command | What it does |
| --- | --- |
| `yarn frontend:start` | Dev server (`modern dev`, SSR) on port 1741. |
| `yarn frontend:build` | Production build (`modern build`): the `staticSitePlugin` post-build step renders every SSG route to static HTML and assembles `build/client` (HTML + `static/` assets + the XML/text endpoints). |
| `yarn frontend:preview` | Serves the production build locally (static `serve` of `build/client`). |
| `yarn lint` (from the repo root) | The verification gate: `biome check` plus `tsc --noEmit` across workspaces (see `scripts/lint.sh`). |

## Routing

Routes come from **file conventions** under `src/routes/**` (`@modern-js/runtime` nested routing):
each route is a directory (or the root for the index) containing `page.tsx` (default-export route
component) and, when it loads data, `page.data.ts` (`export const loader` — runs on the server in
dev, in the browser in the static production build). The root `src/routes/layout.tsx` is the root
layout (`Providers` + `Header` + `LoadingIndicator` + `<Outlet/>` + `Footer`), the root
`src/routes/error.tsx` is the root error boundary (404 page + generic error UI), and
`src/Document.tsx` is the document shell (head, theme preload script, scripts).

`src/modern.routes.ts` is a `defineRoutes` callback that filters the detected route tree: in
production it drops the `post-drafts` / `page-drafts` segments (dev/prod is detected via
`process.env.FL_IS_PROD`, set by `modern.config.ts` from the `command` param — `NODE_ENV` is
`production` in both dev and build). Draft data files additionally 404 in production as defense
in depth (`import.meta.env.PROD` guard).

Per-page `<head>` tags are rendered with `<Helmet>` (`@modern-js/runtime/head`) from the shared
meta module `src/utils/meta.ts` (`baseMeta`, `homeMeta()`, `notFoundMeta()`, `postMeta(entry,
url)`, `pageMeta(entry, url)`; rendered via `src/utils/helmet.tsx` `metaToTags`). Draft routes
add `robots noindex` at the call site. The same module feeds `site-head.ts`, which rebuilds the
`<head>` of the statically rendered pages at build time.

## Path aliases

`tsconfig.json` maps `@@frontend/*` → `./src/*`, `@@common/*` → `../common/src/*`,
`@@content-components/*` → `../content-components/src/*`, and `@@contents/*` →
`../contents/src/*` (overridable via `FL_CONTENTS_DIR`); `modern.config.ts` (`resolve.alias`)
defines the same aliases for the build. Use these aliases for cross-directory imports instead of
deep relative paths. They do **not** resolve in the Node-only CLI/config context (`modern.config.ts`,
`site-xml.ts`, `site-head.ts`) — those files use relative imports only.

## Content (MDX)

Content loaders live in `src/content/`: `posts.server.ts` / `pages.server.ts` (published content,
`import.meta.glob` over `@@contents/posts/**` / `@@contents/pages/**`, zod frontmatter
validation, memoized caches) and `posts-drafts.server.ts` / `pages-drafts.server.ts` (draft
content, in separate modules so the production client bundle never references the draft MDX
chunks — the home loader reaches them through a development-only dynamic import). MDX is compiled
by `@rsbuild/plugin-mdx` (registered via `builderPlugins` in `modern.config.ts`).

## Deployment

Only `build/client` is deployed (Cloudflare Pages). The `dist/` output (including the server
bundle used by the `staticSitePlugin`) is build-only and never deployed.
