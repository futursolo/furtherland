# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A personal blog ("furtherland") built on **Modern.js v3** (`@modern-js/app-tools`,
Rsbuild/Rspack-based, SSR) + **React 19**, styled with **Emotion** (a `theme` object in
`src/providers/theme.tsx` consumed by the `ThemeProvider` and by `styled`/`sx`), client state
via **jotai**, and **MDX** for content. It is a Yarn monorepo (`nodeLinker: node-modules`).
Content is authored as MDX files and loaded by the app; the app is SSR in development, and the
production build is **fully static**: a custom build plugin renders every HTML route to a flat
`build/client/<route>.html` and writes the XML/text endpoints as static files. Nothing is served
from Node in production — the output is deployed to Cloudflare Pages.

## Package manager

- **Yarn 4** via **corepack**. Run `corepack enable` once if `yarn` is not available.
- Always set environment variable `YARN_GLOBAL_FOLDER` to the **project root's** `.yarn/berry`
  (the `.yarn` directory that sits next to `.git` at the repo root) before running yarn. Point it
  at the **absolute** path of that directory (e.g. `$(git rev-parse --show-toplevel)/.yarn/berry`),
  never a relative `.yarn/berry` — a relative value is resolved against the current workspace
  directory, which creates stray `.yarn/` folders inside `packages/*` and can exhaust disk space.
- Always invoke dependencies through `yarn` (e.g. `yarn start`), never `npx`/directly.
- The repo uses `nodeLinker: node-modules` (`.yarnrc.yml`). Modern.js/Rspack does not understand
  Yarn PnP resolution, so do not switch the linker back to `pnp`.
- It is OK to install Node, Yarn (via corepack), and any missing dependencies (via `yarn install`)
  in the current environment to be able to run the project.
- When adding or updating dependencies, do **not** look up or read version numbers (e.g. via
  `yarn info <pkg> version` or the registry) unless absolutely necessary — just run
  `yarn add <pkg>` for new dependencies or `yarn up <pkg>` to update existing ones.

## Git workflow

- **Always inspect the current branch before making changes** (e.g. `git branch --show-current`
  and `git status`).
- **If the current branch is `main`, always start a new branch first** before doing any work
  (e.g. `git switch -c <branch-name>` or `git checkout -b <branch-name>`). Do not make changes or
  commit directly on `main`.
- New working branches should be branched from `main`.
- Choose a descriptive branch name derived from the task (e.g. `fix/<summary>`,
  `feat/<summary>`).
- If a suitable branch other than `main` already exists and the work belongs there, continue on
  it; otherwise create a new one.

## Commands

Run from the **repository root** unless noted. There is **no test suite**.

| Command | What it does |
| --- | --- |
| `yarn lint` | Runs `scripts/lint.sh`: `biome check` (lint + format + import order, per `biome.jsonc`) then `tsc --noEmit` against each workspace's `tsconfig.json` and the root `tsconfig.json`. This is the main verification step after any change. |
| `yarn start` | Modern.js dev server (SSR) on port 1741 (`yarn workspace @furtherland/frontend frontend:start` = `modern dev`). |
| `yarn build` | Production build (`yarn workspace @furtherland/frontend frontend:build` = `modern build`): renders every HTML route to static files and assembles the deploy output under `build/client`. |
| `yarn preview` | Serves the `build/client` static bundle locally (`serve ./build/client`). |

## Monorepo layout

- `packages/frontend/` — the app (`@furtherland/frontend`), a Modern.js (app-tools) + Rspack
  project:
  - `modern.config.ts` — all build configuration: path aliases, the MDX plugin (`@rsbuild/plugin-mdx`
    via `builderPlugins`), `server.ssr: true` (both modes — see "Rendering / build output"),
    `dev.port: 1741`, the dev-server middleware for the XML/text endpoints, the global `html.tags`
    (atom alternate + sitemap links), and the `staticSitePlugin` post-build step.
  - `site-xml.ts` — Node-only generation of the four XML/text endpoints (atom feed, robots.txt,
    sitemaps) by reading MDX frontmatter straight from disk (`yaml` parse, `sitemap`, `feedsmith`).
    Served by the dev middleware; written to the static output by the build plugin. **Relative
    imports only** — path aliases do not resolve in the CLI/config context.
  - `site-head.ts` — Node-only post-processing of the `<head>` of the statically rendered pages
    (see "Rendering / build output"). Relative imports only.
  - `src/` — `Document.tsx` (html/head/body shell + theme preload script), `modern.routes.ts`
    (the file-route filter), `routes/**` (file-convention route modules), `content/**` (MDX
    content loaders), plus `components/`, `elements/`, `providers/`, `utils/`, `constants/`.
- `packages/contents/` (`@furtherland/contents`) — author-facing MDX content:
  - `packages/contents/src/posts/<YYYY-MM-DD>/<slug>.mdx` — blog posts.
  - `packages/contents/src/pages/<slug>.mdx` — standalone pages.
- `packages/common/`, `packages/content-components/` — shared utilities / content components.
- `biome.jsonc`, root `tsconfig.json`, `scripts/` — repo-level tooling.

### Path aliases

Defined in each package's `tsconfig.json` and in `modern.config.ts` (`resolve.alias`):
- `@@frontend/*` → `packages/frontend/src/*`
- `@@common/*` → `packages/common/src/*`
- `@@contents/*` → `packages/contents/src/*` (overridable, see below)
- `@@content-components/*` → `packages/content-components/src/*`

Use these aliases for cross-directory imports rather than deep relative paths. Note that aliases
do **not** resolve in the Node-only CLI/config context (`modern.config.ts`, `site-xml.ts`,
`site-head.ts`) — those files use relative imports only.

## Routing

Routes come from **file conventions** under `packages/frontend/src/routes/**` (`@modern-js/runtime`
nested routing): `page.tsx` (route component, default export), `page.data.ts` (data loader,
`export const loader` — runs on the server in dev, in the browser in the static production
build), and `error.tsx` (Remix-style error boundary; the root one renders the 404 page for
unknown URLs and a generic error UI otherwise). `src/Document.tsx` is the document shell.

`src/modern.routes.ts` is a `defineRoutes` callback that receives the detected route tree and
filters it: in production it drops the `post-drafts` / `page-drafts` segments so draft code never
lands in the client bundle. It detects dev/prod via `process.env.FL_IS_PROD`, which
`modern.config.ts` sets from the `command` param — `process.env.NODE_ENV` is `production` for
*both* `modern dev` and `modern build`, so it cannot be used for this.

Per-page `<head>` tags are rendered with `<Helmet>` (`@modern-js/runtime/head`) from the shared
meta module `src/utils/meta.ts` (`baseMeta`, `homeMeta`, `notFoundMeta`, `postMeta`, `pageMeta`;
rendered by `src/utils/helmet.tsx` `metaToTags`). Draft routes add `robots noindex` at the call
site.

## Rendering / build output

`server.ssr` is `true` in **both** dev and the production build:

- **Dev (`modern dev`)**: full SSR on port 1741. Data loaders run per request; the XML/text
  endpoints are answered by a `dev.setupMiddlewares` middleware (short-circuits before SSR);
  draft routes are live.
- **Prod (`modern build`)**: the build emits a server bundle that is **not** deployed. Instead,
  the custom `staticSitePlugin` (`CliPlugin<AppTools>`, `api.onAfterBuild` in
  `modern.config.ts`) boots the freshly built production server (`createProdServer` +
  `loadServerPlugins` from `@modern-js/prod-server`, a direct devDep), renders each SSG route
  (`/`, `/404`, every published post/page) **sequentially** via `requestHandler` (the mock
  request carries `x-modern-ssg-render: 'true'` so the full page is awaited), and writes the
  flattened `build/client/<route>.html` (`/` → `index.html`, `/404` → `404.html`, `/posts/x` →
  `posts/x.html`). It copies `dist/static` → `build/client/static` and writes the four XML/text
  files from `site-xml.ts`.
  - Why sequential: the framework SSG plugin renders up to 10 routes concurrently in one process,
    and `react-helmet`'s module-level state is then shared across interleaved renders, corrupting
    the `<head>`.
  - Why the static-head post-processing: the framework captures the `<head>` (react-helmet
    `renderStatic()`) *before* the router's post-load state update renders the route's
    `<Helmet>`, and react-helmet's server-side meta rendering is broken in this stack — so
    `site-head.ts` `fixStaticHead()` rebuilds each static file's `<head>` from the same shared
    meta module the routes render with, guaranteeing parity.
- The deploy output is `build/client` (unchanged from the previous setup, so the Cloudflare Pages
  dashboard needs no changes). Only `build/client` is deployed.

`@@contents` resolves to `packages/contents/src` by default and can be overridden with the
`FL_CONTENTS_DIR` env var; when set, the value is resolved relative to the cwd of the `yarn`
command that runs the build (i.e. `process.cwd()`), rather than the package directory.

### Draft content isolation

Drafts must never reach the production client bundle (the static production build's client-side
router runs data loaders in the browser, so every module a loader imports is bundled). This is
enforced twice:

1. `src/modern.routes.ts` drops the draft routes from the production route tree.
2. The draft `import.meta.glob`s live in separate content modules
   (`src/content/posts-drafts.server.ts`, `src/content/pages-drafts.server.ts`) that only the
   draft data files import; the home data file reaches them through a development-only dynamic
   import (`import.meta.env.PROD ? … : import('@@frontend/content/posts-drafts.server')`), which
   is dead code — and thus unbundled — in production.

Verify with a bundle audit after any change: no draft titles/slugs/content
(e.g. `Test Draft` / `Test Page`) in `build/client/static/js/**`.

## Content (MDX) conventions

- Posts live at `packages/contents/src/posts/<YYYY-MM-DD>/<slug>.mdx` (published) or
  `packages/contents/src/post-drafts/<YYYY-MM-DD>/<slug>.mdx` (drafts), carrying YAML frontmatter
  `title`, `date`, `slug`, and optional `description`. Pages live at
  `packages/contents/src/pages/<slug>.mdx` (published) or
  `packages/contents/src/page-drafts/<slug>.mdx` (drafts), carrying `title`, `slug`, and optional
  `description`.
- The `slug` must match the file name, and for posts the `date` frontmatter must match the
  containing directory name — this keeps the URL (`/posts/<slug>`, or `/post-drafts/<slug>` for
  drafts) and the on-disk path in sync, which is what the loaders' `import.meta.glob` globs rely
  on.
- **Drafts**: content is collected from two separate `import.meta.glob` globs per type —
  published (`posts/` / `pages/`) and draft (`post-drafts/` / `page-drafts/`, in their own
  modules — see "Draft content isolation") — so an entry's `isDraft` is set by which collection
  it came from. Drafts are served at `/post-drafts/<slug>` and `/page-drafts/<slug>`
  (previewable in dev, 404 in production — the routes don't exist there), and are hidden from the
  home list, sitemap, and Atom feed. See
  `packages/contents/src/post-drafts/2099-12-31/test-draft.mdx` and
  `packages/contents/src/page-drafts/test.mdx`.
- MDX is compiled by `@rsbuild/plugin-mdx` (registered via `builderPlugins` in
  `modern.config.ts`, with `remark-frontmatter` / `remark-mdx-frontmatter` / `remark-gfm` and
  Shiki light/dark highlighting + github-alerts); frontmatter is validated with **zod** (see
  `src/content/posts.server.ts` / `pages.server.ts`) and invalid frontmatter throws.

## Code style

- Lint/format/import-ordering is enforced by **Biome** (`biome.jsonc`): 2-space indent, single
  quotes, semicolons always, trailing commas, 100-col width, LF endings, auto import
  organization.
- TypeScript is `strict`. Keep new code type-clean — `yarn lint` runs `tsc --noEmit` against each
  workspace.
- Use **arrow functions only** — never `function` declarations or `function` expressions. Define
  them as `const` arrow functions (e.g. `const foo = (x: T): R => {}`); use `export const` for
  named exports, and for a default-exported component use `const X = () => {}; export default X`
  to preserve the component name.
- Prefer the existing patterns (Emotion `styled`/`sx` + the `theme`, jotai atoms, the
  `@@frontend/components` and `@@frontend/elements` barrels) over introducing new conventions.
- Never try to format code or organise imports manually, and never read the Biome configuration
  (`biome.jsonc`) by hand to figure out the rules.
- To fix Biome errors (lint/format/import-ordering), apply the autofix first: run
  `yarn biome check --write`. Only after the autofix has been applied, resort to manual editing
  for whatever the autofix could not fix.
- Do not add a test framework unless asked; `yarn lint` is the verification gate.
- Do not add comments in code unless asked.

## Deployment

- This site is deployed to **Cloudflare Pages**, configured directly in the Cloudflare dashboard
  and driven by pushes to the git repository.
- **Never create a Wrangler configuration file** (e.g. `wrangler.jsonc` / `wrangler.toml`);
  deployment is configured from the git repository, not from a local Wrangler config.

## Conventions to respect

- Server-only logic uses the `*.server.tsx` / `*.server.ts` file suffix convention (content
  loaders); keep Node-only APIs out of client-reachable modules. The exceptions are the
  Node-only CLI/context modules at the package root (`site-xml.ts`, `site-head.ts`) and
  `modern.config.ts` itself — those use relative imports only.
- The build configuration lives in `packages/frontend/modern.config.ts` (aliases, plugins,
  `server`, `dev`, `html`). There is no separate Vite/React-Router config and no typegen step.
- The frontend `.gitignore` excludes `node_modules` (which covers the generated route code under
  `node_modules/.modern-js/`), `build/`, `dist/`, and `src/generated/`. Don't commit build output.
- React components can accept other React components as children (and vice versa).
