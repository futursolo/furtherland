# Plan: Port `@furtherland/frontend` from React Router (Vite) to Modern.js

Status: **draft** — branch `feat/modern-js`.

## 1. Goal

Replace the React Router v8 (framework mode, Vite-based) frontend with **Modern.js v3**
(Rspack-based, `@modern-js/app-tools` 3.9.3), keeping:

- the same monorepo layout, path aliases, Emotion styling, jotai state, MDX content pipeline,
  and Cloudflare Pages static deployment;
- the same **rendering strategy**: SSR in development, a fully **static** build in production
  (every HTML route pre-rendered; XML routes written as static files; nothing served from Node
  in production);
- the same URL space: `/`, `/posts/<slug>`, `/pages/<slug>`, `/post-drafts/<slug>` (dev only),
  `/page-drafts/<slug>` (dev only), `/atom.xml`, `/robots.txt`, `/sitemap-index.xml`,
  `/sitemap-0.xml`, and a 404 page for everything else.

### Already done on this branch

- `packages/frontend/package.json` deps swapped: `react-router` → `@modern-js/runtime`,
  `@react-router/node` → `@modern-js/server-runtime`, `@react-router/dev` + `vite` +
  `@vitejs/plugin-react` + `rollup` + `vite-node` → `@modern-js/app-tools` +
  `@modern-js/plugin-ssg`, `@mdx-js/rollup` → `@mdx-js/loader`, plus `@yarnpkg/pnpify` and
  `yaml` added; `@furtherland/vite-plugins` removed from the frontend deps.
- Minimal `modern.config.ts`, `src/Document.tsx`, `src/routes/layout.tsx`, `src/routes/page.tsx`
  skeleton files (a smoke test that `modern` can discover routes).
- `yarn install` run; all `@modern-js/*@3.9.3` packages resolved in the lockfile.

### Known environment constraint (verified)

Modern.js does **not** understand Yarn PnP resolution (its CLI fails with
`Can not find module @modern-js/runtime/cli` under raw PnP; Rspack's resolver also needs real
directories). The working invocation is via **pnpify** (dep already added):

```sh
yarn exec pnpify run modern <dev|build|...>   # from packages/frontend/
```

All `frontend:*` scripts will go through this. (Fallback if pnpify proves flaky/slow in CI:
a small Rspack resolve plugin backed by the PnP API, or switching the repo to
`nodeLinker: node-modules` — last resort.)

## 2. Feature mapping (React Router → Modern.js v3)

| React Router (current) | Modern.js v3 (target) |
| --- | --- |
| `src/routes.ts` (`flatRoutes`) | **File-convention routing kept**, plus a small `src/modern.routes.ts` (`defineRoutes` from `@modern-js/runtime/config-routes`) that receives the auto-detected `fileRoutes` and returns them **filtered** — dropping the `post-drafts` / `page-drafts` segments in production (the current `ignoredRouteFiles` behavior). Verified in the installed `@modern-js/runtime`: the callback's return value replaces the detected routes (`routes.length = 0` in `generateRoutesForEntry`), and `processConfigRoute` passes routes with `origin: 'file-system'` through untouched, so all file conventions (`page.data.ts`, `page.error.tsx`, `[slug]` dynamic naming, dev file watching) keep working. No route tree is written by hand. |
| Route modules exporting `loader` | Same-named **data files**: `page.data.ts` / `layout.data.ts` exporting `loader`. In SSR (dev) they run on the server; in client navigation the client fetches data from the SSR server. In the SSG build they run at build time. |
| Route modules exporting default component + `Route.ComponentProps.loaderData` | Default-export component; data via `useLoaderData<T>()` from `@modern-js/runtime/router` (re-exports React Router v7, so `Link`, `Outlet`, `useParams`, `useLocation`, `useNavigation`, `data`, etc. all come from there). |
| Route modules exporting `meta` / `links` | `<Helmet>` from `@modern-js/runtime/head` (react-helmet, SSR-aware) rendered inside the page/layout component; global tags (charset, viewport, `og:site_name`) via the `html.meta` config. |
| `root.tsx` `Layout` (document shell) | `src/Document.tsx` using `Html`, `Head`, `Body`, `Root`, `Scripts`, `Script` from `@modern-js/runtime/document` (filename convention verified: `Document`). |
| `root.tsx` `ErrorBoundary` (404 + generic) | Per-route **error files**: `layout.error.tsx` / `page.error.tsx` siblings (Remix-style error boundaries, ported from Remix — verified in the runtime source). Root `layout.error.tsx` handles 404s (renders `<NotFound/>` + noindex `<Helmet>`). |
| `root.tsx` `Root` (LoadingIndicator + RootLayout + Outlet) | `src/routes/layout.tsx` (root layout: `Providers`, `Header`, `Outlet`, `Footer`, `LoadingIndicator`). |
| `ScrollRestoration` | Not provided by Modern.js — implement a ~20-line equivalent (scroll-to-top on navigation + session-history restore) in the root layout, or drop deliberately. |
| `import.meta.glob('@@contents/**')` (posts/pages loaders, prepare-prerender) | **Kept as-is.** Rspack supports `import.meta.glob` since v2.1, and Modern.js 3.9.3 bundles `@rspack/core@2.2.9` (verified in the lockfile). Lazy glob form matches the current usage; the `FL_CONTENTS_DIR` override keeps working because it only changes where the `@@contents` alias points. The dynamic `import(\`@@contents/posts/${date}/${slug}.mdx\`)` pattern is unchanged (one async chunk per MDX file). Two verifications: (a) glob patterns containing the `@@contents` alias resolve under Rspack; (b) TS types — replace `vite/client` with `@rspack/core/module` in the frontend `tsconfig.json` (provides the `import.meta.glob` typings). |
| `import.meta.env.PROD` | **Kept as-is.** Rsbuild (Modern.js's build layer) defines `import.meta.env.MODE`/`DEV`/`PROD`/`SSR` via `source.define` by default. |
| `@mdx-js/rollup` (Vite) | **`@rsbuild/plugin-mdx`** (official Rsbuild plugin, v1.1.3; peer `@rsbuild/core ^1 \|\| ^2` — compatible with the bundled 2.2.9; depends on `@mdx-js/loader ^3.1.1` itself). Registered per environment via a small in-repo Modern.js plugin using the `modifyBuilderEnvironments` hook (`environments[<env>].plugins.push(pluginMdx(...))` — hook + `EnvironmentConfig.plugins` verified in the installed `@modern-js/app-tools`). `mdxLoaderOptions` carries the same remark/rehype plugins (frontmatter, GFM, Shiki light/dark, github-alerts). Bonus over a raw `tools.rspack` rule: it reuses the project's SWC loader on the MDX rule and **extends React Fast Refresh to `.mdx` files** (dev HMR) — both verified against the plugin source. Drop the direct `@mdx-js/loader` devDep (the plugin owns it). |
| Prerender pipeline (`react-router.config.ts` + `prepare-prerender.ts` + `+collectPrerender.tsx` + `buildEnd` renames) | `@modern-js/plugin-ssg` + `output.ssg: { routes: [...] }`. The concrete route list (home + every published post/page slug) is **computed in `modern.config.ts`** by scanning the contents package at build time (this replaces `staticPaths.json` and all `+collectPrerender.tsx` files). Post-build assembly step (a small app plugin `onAfterBuild` hook + a finalize script) writes the XML files and `404.html` and assembles the deploy directory. |
| Non-HTML routes (`atom[.]xml`, `robots[.]txt`, `sitemap-*[.]xml` loaders returning `Response`) | Two mechanisms: (1) **dev/SSR** — Hono middlewares in `server/modern.server.ts` (`defineServerConfig` from `@modern-js/server-runtime`) intercept the four paths and return the XML/text; (2) **prod/static** — a build-time `onAfterBuild` step writes the same files into the output. The builders move out of `src/routes/**` into `src/content/` (pure Node functions, shared by both). |
| `buildEnd` rename (`<slug>/index.html` → `<slug>.html`) + `404.html` | Part of the post-build assembly (see §5, Phase 7). |
| `vite.config.ts` / `vite.node.config.ts` / `react-router.config.ts` | Deleted; everything moves into `modern.config.ts`. |
| `react-router typegen` + `.react-router/+types` | Deleted. Loader/params types are written explicitly (`useLoaderData<PostEntry>()`, loader args typed via the runtime's `LoaderFunctionArgs`). |
| `multiviewImagePlugin` (`@furtherland/vite-plugins`) | **Not ported now** — no content uses `?multiview` imports yet. The plugin package stays in the monorepo (self-contained, still type-checks with its own `vite` devDep) but is not registered in the Modern.js build. Port to the Rspack plugin API as a follow-up when it is actually used. |

## 3. Target rendering strategy

Modern.js **forbids SSG and SSR on the same route at build time** (the SSG plugin throws
`ssg can not using with ssr` — verified in plugin source). This matches the current setup
exactly (`ssr: FL_BUILDING !== 'true'`):

- **Dev (`modern dev`)**: `server.ssr: true` → full SSR, data loaders run per request, XML
  routes served by server middleware, draft routes live.
- **Prod (`modern build`)**: NODE_ENV=production ⇒ `server.ssr: false` automatically, and
  `output.ssg: { routes: [ …concrete urls… ] }` pre-renders every HTML route to static files.
  XML files + `404.html` written by build hooks. The result is a pure static site
  (deployed to Cloudflare Pages, no Node runtime).

`server.ssr` is therefore simply `process.env.NODE_ENV !== 'production'` — the `FL_BUILDING`
env var is no longer needed.

## 4. Target route tree

```
packages/frontend/
├── modern.config.ts            # aliases, MDX plugin, html.meta, server.ssr, dev.port, output.ssg
├── server/
│   └── modern.server.ts        # Hono middlewares: /atom.xml, /robots.txt, /sitemap-*.xml (dev SSR)
├── src/
│   ├── Document.tsx            # html/head/body shell, theme preload script, base head tags
│   ├── modern.routes.ts        # defineRoutes: pass fileRoutes through, drop drafts in prod
│   ├── routes/
│   │   ├── layout.tsx          # Providers + Header(headerKind) + LoadingIndicator + Outlet + Footer
│   │   ├── layout.data.ts      # (none needed at root — omit)
│   │   ├── layout.error.tsx    # 404/error boundary: NotFound + generic error UI (+ Helmet noindex)
│   │   ├── page.tsx            # home (post list)
│   │   ├── page.data.ts        # summaries (drafts included in dev)
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx    # H1 + Author + MdxRenderer + LazyOnly(PostComments)
│   │   │       ├── page.data.ts# getPost(slug) → entry or 404
│   │   │       └── page.error.tsx (optional; falls back to root boundary)
│   │   ├── pages/[slug]/       # page.tsx + page.data.ts (same shape)
│   │   ├── post-drafts/[slug]/ # page.tsx + page.data.ts (dev-only routes)
│   │   ├── page-drafts/[slug]/ # page.tsx + page.data.ts (dev-only routes)
│   │   └── 404/page.tsx        # renders <NotFound/> + noindex Helmet (SSG'd → renamed to 404.html)
│   ├── content/
│   │   ├── posts.server.ts     # unchanged (import.meta.glob works on Rspack 2.2.9)
│   │   ├── pages.server.ts     # unchanged
│   │   ├── sitemap.server.ts   # unchanged (pure)
│   │   ├── feed.server.ts      # moved from routes/atom[.]xml/feed.server.ts
│   │   └── types.ts            # unchanged
│   └── (components/elements/providers/utils/constants: unchanged except react-router imports → @modern-js/runtime/router)
└── scripts/
    └── build.sh                # pnpify modern build + finalize (xml, 404.html, assemble build/client)
```

The route tree comes from file conventions; `src/modern.routes.ts` only filters it:

```ts
import { defineRoutes } from '@modern-js/runtime/config-routes';

const DRAFT_SEGMENTS = ['post-drafts', 'page-drafts'];

export default defineRoutes(
  (_, fileRoutes) =>
    process.env.NODE_ENV === 'production'
      ? fileRoutes.map((route) => ({
          ...route,
          children: route.children?.filter((child) => !DRAFT_SEGMENTS.includes(child.path)),
        }))
      : fileRoutes,
);
```

(`fileRoutes` is the detected `NestedRoute[]` tree — `path` is the per-segment value, e.g.
`post-drafts`, `:slug`. Verified semantics: the return value replaces the detected routes;
`origin: 'file-system'` routes pass through the converter unchanged; dev file watching covers
both route components and the config file.)

## 5. Phases

### Phase 0 — Smoke test (mostly done)

- [x] Deps swapped, `yarn install` clean, `yarn exec pnpify run modern --version` works.
- [ ] Confirm `yarn exec pnpify run modern dev` boots the skeleton (`Document.tsx` +
  `layout.tsx` + `page.tsx`) on port 1741 with Rspack resolving `react`/`@modern-js/runtime`
  through the pnpify tree. This de-risks the whole plan (MDX, data loaders, and SSG all
  stack on it).

### Phase 1 — Framework config

- `modern.config.ts`:
  - `source`/`resolve` aliases: `@@frontend`, `@@common`, `@@contents` (incl.
    `FL_CONTENTS_DIR` override, resolved against `process.cwd()` as today),
    `@@content-components`.
  - **MDX via `@rsbuild/plugin-mdx`**: a small in-repo Modern.js plugin
    (`scripts/plugins/mdx.ts` or inline) taps `api.modifyBuilderEnvironments` and pushes
    `pluginMdx({ extensions: ['.mdx'], mdxLoaderOptions: { remarkPlugins:
    [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm], rehypePlugins: [[rehypeShiki,
    { themes: { light: 'github-light', dark: 'github-dark' } }], rehypeGithubAlerts] } })`
    into each environment's `plugins`.
  - `html.meta`: global `baseMeta` (charset, viewport, `og:site_name`) + global `link` tags
    (atom alternate, sitemap) — or keep links in the root `<Helmet>` if `html` config can't
    express them.
  - `server.ssr: process.env.NODE_ENV !== 'production'`, `dev.port: 1741`.
  - `output.ssg: { routes: ssgRoutes }` (see Phase 7 for how the list is computed).
  - `plugins: [appTools(), ssgPlugin(), mdxPlugin()]`.
- Deps: `yarn workspace @furtherland/frontend add -D @rsbuild/plugin-mdx`; remove the direct
  `@mdx-js/loader` devDep (owned by the plugin).
- Verify: MDX compiles under Rspack (frontmatter typed, Shiki spans present), the plugin
  finds Modern.js's SWC loader on the JS rule (standard `CHAIN_ID` — verified in
  `adapterBasic`), `.mdx` edits hot-reload via Fast Refresh, alias + `FL_CONTENTS_DIR` work,
  dev SSR round-trips.

### Phase 2 — Document & root shell

- `src/Document.tsx`: port the head from `root.tsx` — theme preload inline script (via
  `html.tags` config or a `Script` with a function body — check which the document runtime
  inlines), `<Head/>`, `<Root/>`, `<Scripts/>`.
- `src/routes/layout.tsx`: `Providers` + `Header headerKind={pathname === '/' ? 'home' :
  'default'}` (from `useLocation`) + `LoadingIndicator` + `<Outlet/>` + `Footer`.
- `src/routes/layout.error.tsx`: port `root.tsx` `ErrorBoundary` (NotFound for 404, generic
  error UI otherwise) + `<Helmet>` (404 title + `robots noindex`).
- Swap `react-router` imports for `@modern-js/runtime/router` across
  `components/Link.tsx`, `components/LoadingIndicator.tsx`, etc.
- Decide on scroll restoration (implement small equivalent in root layout, or drop).

### Phase 3 — Data layer

- **No rewrite needed**: `posts.server.ts` / `pages.server.ts` keep their
  `import.meta.glob('@@contents/...')` usage as-is (supported by the bundled Rspack 2.2.9).
- Verify under the new build: the glob (with the `@@contents` alias pattern) resolves the
  same set of MDX modules, lazy chunks still split per post, zod frontmatter validation and
  the memoized caches behave identically, and `import.meta.env.PROD` gates (home summaries,
  draft 404s) evaluate correctly in dev vs build.
- These modules stay server-only by usage (data loaders + build hooks); keep the
  `*.server.ts` naming convention.

### Phase 4 — Routes

- Write `src/modern.routes.ts` as the `fileRoutes` filter (sketch in §4) — no hand-written
  route tree.
- Migrate each route module:
  - `_index/route.tsx` → `routes/page.tsx` + `routes/page.data.ts`
    (summaries; drafts in dev via `process.env.NODE_ENV !== 'production'`).
  - `posts.$slug/` → `routes/posts/[slug]/` (fold `Layout.tsx` into `page.tsx`; loader →
    `page.data.ts`; `createMeta` → `<Helmet>` block in the page; 404 throw via
    `data('Not Found', { status: 404 })` from `@modern-js/runtime/router`).
  - `pages.$slug/` → `routes/pages/[slug]/` (same shape).
  - `post-drafts.$slug/`, `page-drafts.$slug/` → `routes/post-drafts/[slug]/`,
    `routes/page-drafts/[slug]/` (prod 404 is now structural — routes don't exist in prod —
    keep the runtime guard as defense in depth).
  - `404/page.tsx`: `<NotFound/>` + noindex Helmet.
- Delete `src/routes.ts`, the old `src/routes/**/route.tsx|common.tsx|Layout.tsx` modules,
  all `+collectPrerender.tsx` files, and `src/scripts/prepare-prerender.ts`.

### Phase 5 — Meta/SEO parity

- Per-page `<Helmet>` from the existing `createMeta` logic (title, description, og:*,
  article:*, canonical link; drafts add `robots noindex`; 404 handled in the error file).
- Root-level links (atom alternate, sitemap) — `html.tags`/`html.links` config or a
  `<Helmet>` in the root layout.
- Verify the rendered `<head>` of `/`, a post, a page, a draft, and a 404 matches the
  current output (tag order/casing can differ; content must not).

### Phase 6 — Non-HTML routes

- Move the builders: `routes/atom[.]xml/feed.server.ts` → `src/content/feed.server.ts`;
  sitemap/robots builders → `src/content/sitemap.server.ts` (extend) — pure Node functions
  returning strings.
- `server/modern.server.ts`: Hono middlewares (path-matched `get`) for `/atom.xml`,
  `/robots.txt`, `/sitemap-index.xml`, `/sitemap-0.xml` with the correct content types —
  active in dev SSR (and any SSR deployment).
- Verify in dev: all four return byte-identical payloads to the current app.

### Phase 7 — Production static pipeline

- `modern.config.ts`: compute `ssgRoutes` at config-load time by scanning the contents
  package (node:fs + `yaml` frontmatter parse — `yaml` dep already added):
  `['/', '/404', ...published posts as '/posts/<slug>', ...published pages as
  '/pages/<slug>']`.
- Small in-repo app plugin (in `modern.config.ts` or a sibling module) with
  `api.onAfterBuild`:
  - write `atom.xml`, `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml` into the dist dir;
  - (SSG already wrote `404/index.html` from the `/404` route.)
- `scripts/build.sh` (replaces the old Vite two-stage build):
  1. `yarn exec pnpify run modern build`
  2. finalize: assemble `build/client` — copy SSG HTML out of `dist/html/index/**`,
     copy static assets (JS/CSS, location verified after first build: `dist/web/**` or
     `dist/static/**`) next to them; rename `<slug>/index.html` → `<slug>.html` and
     `404/index.html` → `404.html` (mirrors the old `buildEnd` behavior); keep the deploy
     output path (`build/client`) unchanged so the Cloudflare Pages dashboard needs no
     changes.
- `frontend:preview` keeps working (`serve ./build/client`).
- Verify the static site: every HTML page loads standalone (curl), asset URLs resolve,
  client-side navigation works (route manifest inlined by default), XML files present,
  unknown URL → `404.html`.

### Phase 8 — Cleanup & tooling

- Delete `vite.config.ts`, `vite.node.config.ts`, `react-router.config.ts`, `src/root.tsx`,
  `src/root/`, `src/generated/` (gitignore entry), `.react-router/` (gitignore entry).
- `packages/frontend/package.json` scripts:
  - `frontend:start` → `exec pnpify run modern dev`
  - `frontend:build` → `scripts/build.sh`
  - `frontend:preview` → unchanged
  - drop `frontend:typegen`.
- `scripts/lint.sh`: remove the `frontend:typegen` line.
- `packages/frontend/tsconfig.json`: drop the `.react-router/types` include/rootDir; swap
  `vite/client` for `@rspack/core/module` types (provides the `import.meta.glob` typings);
  keep aliases; re-run `yarn lint` to green (tsc + biome).
- Deps: add `@rsbuild/plugin-mdx` (devDep), remove `@mdx-js/loader` (owned by the plugin);
  keep `@yarnpkg/pnpify`, `yaml`.
- Docs: update root & frontend `AGENTS.md` (framework, commands, routing conventions,
  rendering section) and `README.md` if it mentions the stack.
- `packages/frontend/dist/` (route-inspect artifacts from the smoke test): gitignore.

## 6. Verification checklist (parity with the current app)

1. `yarn lint` green (biome + tsc across workspaces).
2. Dev SSR: home lists posts (+drafts), post/page render MDX with Shiki highlighting and
   github-alert styling, drafts reachable at `/post-drafts/*` and `/page-drafts/*` and
   `noindex`, theme toggle + preload script behavior unchanged, Giscus comments load on
   posts only (check bundle isolation of the giscus chunk), loading bar shows on nav.
3. Dev SSR: `/atom.xml`, `/robots.txt`, `/sitemap-index.xml`, `/sitemap-0.xml` return
   correct content types and payloads; unknown path → 404 status + NotFound UI + noindex.
4. Prod build: static file set == current build's set (same HTML pages, XML files,
   `404.html`, `<slug>.html` layout); no Node required to serve (`yarn preview` only).
5. Prod: no draft URLs (404), no draft code in client bundles; sitemap/atom contain only
   published content.
6. Meta parity: compare `<head>` of `/`, a post, a page, a draft, a 404 between old and
   new builds.
7. `FL_CONTENTS_DIR` override still honored (dev + build).
8. Cloudflare Pages: build command/output unchanged (dashboard untouched).

## 7. Risks & open questions

| # | Item | Mitigation |
| --- | --- | --- |
| 1 | `@rsbuild/plugin-mdx` under Modern.js (JS-rule/SWC-loader detection via standard `CHAIN_ID`; Fast Refresh patch for `.mdx`) | Plugin source inspected; Modern.js uses standard chain IDs (verified in `adapterBasic`); de-risk first in Phase 1 with one real post (frontmatter + Shiki + alerts) and an HMR edit. Fallback: raw `tools.rspack` rule with the same `mdxLoaderOptions`. |
| 2 | pnpify build performance (materializes node_modules; heavy with Rspack + SSG) | Measure in Phase 0/7. Fallbacks: PnP-aware Rspack resolve plugin, or `nodeLinker: node-modules`. |
| 3 | `fileRoutes` filtering semantics in `modern.routes.ts` (pass-through of `origin: 'file-system'` routes, dev file watching) | Verified in the installed `@modern-js/runtime` source; still smoke-test in Phase 4 (dev: drafts present; build: drafts absent). |
| 4 | `import.meta.glob` with the `@@contents` alias pattern under Rspack (alias resolution inside glob patterns) | Verify in Phase 1/3 against a real post + the `FL_CONTENTS_DIR` override. Fallback: relative glob paths. |
| 5 | 404 status codes in dev SSR (does an unmatched path render `layout.error.tsx` with 404?) | Verify in Phase 2; fallback: splat route whose data loader throws a 404 `Response`. |
| 6 | SSG rendering of the `/404` route and exact dist layout (`dist/html/index/...`, assets dir) | Inspect first build output; finalize script adapts (Phase 7). |
| 7 | Scroll restoration behavior change if dropped | Small custom implementation in root layout (session-history keyed). |
| 8 | Draft code absent from prod client bundle (goal) vs present (leak) | `fileRoutes` filter removes draft routes from the prod route tree; verify in bundle audit (Phase 8). |
| 9 | `@yarnpkg/pnpify` + Cloudflare Pages build env (corepack/yarn availability already in use) | Keep build command shape (`yarn workspace … frontend:build`); validate in Phase 7 locally with a clean `.yarn` state if possible. |

## 8. Out of scope (for now)

- Porting `@furtherland/vite-plugins` (multiview images) to Rspack — unused by content.
- Switching the repo off Yarn PnP.
- RSC mode (Modern.js supports it; not needed for this site).
- Any visual/UX changes beyond scroll restoration (if dropped) and incidental head-tag
  ordering.
