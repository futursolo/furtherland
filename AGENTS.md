# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A personal blog ("furtherland") built on **React Router** (v8, framework mode — Vite-based, SSR) + **React 19**, styled with **Emotion** (a `theme` object in `src/providers/theme.tsx` consumed by the `ThemeProvider` and by `styled`/`sx`), client state via **jotai**, and **MDX** for content. It is a Yarn monorepo (node linker: `pnp`). Content is authored as MDX files and loaded by the app; the app is SSR by default, with a small set of routes (the Atom feed, `robots.txt`, and the sitemap) prerendered to static files at build time.

## Package manager

- **Yarn 4** via **corepack**. Run `corepack enable` once if `yarn` is not available.
- Always set environment variable `YARN_GLOBAL_FOLDER` to the **project root's** `.yarn/berry` (the `.yarn` directory that sits next to `.git` at the repo root) before running yarn. Point it at the **absolute** path of that directory (e.g. `$(git rev-parse --show-toplevel)/.yarn/berry`), never a relative `.yarn/berry` — a relative value is resolved against the current workspace directory, which creates stray `.yarn/` folders inside `packages/*` and can exhaust disk space.
- Always invoke dependencies through `yarn` (e.g. `yarn react-router dev`), never `npx`/directly.
- It is OK to install Node, Yarn (via corepack), and any missing dependencies (via `yarn install`) in the current environment to be able to run the project.
- When adding or updating dependencies, do **not** look up or read version numbers (e.g. via `yarn info <pkg> version` or the registry) unless absolutely necessary — just run `yarn add <pkg>` for new dependencies or `yarn up <pkg>` to update existing ones.

## Git workflow

- **Always inspect the current branch before making changes** (e.g. `git branch --show-current` and `git status`).
- **If the current branch is `main`, always start a new branch first** before doing any work (e.g. `git switch -c <branch-name>` or `git checkout -b <branch-name>`). Do not make changes or commit directly on `main`.
- New working branches should be branched from `main`.
- Choose a descriptive branch name derived from the task (e.g. `fix/<summary>`, `feat/<summary>`).
- If a suitable branch other than `main` already exists and the work belongs there, continue on it; otherwise create a new one.

## Commands

Run from the **repository root** unless noted. There is **no test suite**.

| Command | What it does |
| --- | --- |
| `yarn lint` | Runs `scripts/lint.sh`: `biome check` (lint + format + import order, per `biome.jsonc`) then `tsc --noEmit` against each workspace's `tsconfig.json` and the root `tsconfig.json`. This is the main verification step after any change. |
| `yarn start` | React Router dev server (Vite) on port 1741 (`yarn workspace @furtherland/frontend frontend:start` = `react-router dev`). |
| `yarn build` | Production build (`yarn workspace @furtherland/frontend frontend:build` = `react-router build`): prerenders the routes listed in `react-router.config.ts` to static files under `build/client`. |
| `yarn preview` | Serves the `build/` output locally (`yarn workspace @furtherland/frontend frontend:preview` = `react-router-serve ./build/server/index.js`). |

Package scripts that shell out to a dependency (e.g. `react-router`, `react-router-serve`, `vite`) must be run through `yarn` from the owning package directory (e.g. `yarn frontend:start` from `packages/frontend`).

## Monorepo layout

- `packages/frontend/` — the app (`@furtherland/frontend`), a React Router (framework mode) + Vite project. The root module (`src/root.tsx`), route config (`src/routes.ts`), route modules (`src/routes/**`), generated route types (`.react-router/`), layouts, components, elements, providers, atoms, and utils live here, alongside the content loaders (`src/content/**`), the Vite build config (`vite.config.ts`), and the React Router app config (`react-router.config.ts`).
- `packages/contents/` (`@furtherland/contents`) — author-facing MDX content:
  - `packages/contents/src/posts/<YYYY-MM-DD>/<slug>.mdx` — blog posts.
  - `packages/contents/src/pages/<slug>.mdx` — standalone pages.
- `packages/common/`, `packages/post-components/` — shared utilities / post components.
- `biome.jsonc`, root `tsconfig.json`, `scripts/` — repo-level tooling.

### Path aliases

Defined in each package's `tsconfig.json` (and wired into the Vite build via `vite.config.ts` `resolve.alias`):
- `@@frontend/*` → `packages/frontend/src/*`
- `@@common/*` → `packages/common/src/*`
- `@@contents/*` → `packages/contents/src/*`
- `@@post-components/*` → `packages/post-components/src/*`

Use these aliases for cross-directory imports rather than deep relative paths.

## Routing

Routes are declared in `packages/frontend/src/routes.ts` using `route()` / `index()` / `layout()` from `react-router`; each route is a module under `src/routes/**` exporting a `default` component plus `loader` / `meta`. The root module `src/root.tsx` provides the document `Layout` (head, theme init script, `<Header>` / `<Footer>`) and `meta` / `links`. Typed route params / `loaderData` come from generated `+types` modules under `.react-router/` (imported in each route as `./+types/<id>`) — regenerate with `yarn workspace @furtherland/frontend frontend:typegen` (`react-router typegen`); it also runs automatically during `yarn lint` and the dev server. Dynamic routes (posts, pages) look their content up by slug at request time.

## Rendering / build output

The app is **SSR** (React Router / Vite). A small set of routes — the Atom feed (`/atom.xml`), `/robots.txt`, and the sitemap (`/sitemap-index.xml`, `/sitemap-0.xml`) — are explicitly **prerendered** to static files under `build/client/` at build time; prerendering is declared in `react-router.config.ts` (`ssr: true` plus a `prerender` path list) and wired into the build by the `reactRouter()` Vite plugin. Everything else is served from Node.

`@@contents` resolves to `packages/contents/src` by default and can be overridden with the `FL_CONTENTS_DIR` env var; when set, the value is resolved relative to the cwd of the `yarn` command that runs the build (i.e. `process.cwd()`), rather than the package directory.

## Content (MDX) conventions

- Posts live at `packages/contents/src/posts/<YYYY-MM-DD>/<slug>.mdx` and carry YAML frontmatter: `title`, `date`, `slug`, and optional `description`.
- The `slug` must match the file name, and the `date` frontmatter must match the containing directory name — this keeps the URL (`/posts/<slug>`) and the on-disk path in sync, which is what the `import.meta.glob` loader relies on.
- **Drafts**: a post with `date: '2099-12-31'` is a draft (`isDraft`) and is hidden from the home list in production builds (shown in dev). See `packages/contents/src/posts/2099-12-31/test.mdx`.
- MDX is compiled by `@mdx-js/rollup` (with `remark-frontmatter` / `remark-mdx-frontmatter` / `remark-gfm` and Shiki highlighting) in `vite.config.ts`; frontmatter is validated with **zod** (see `src/content/posts.ts`) and invalid frontmatter throws.

## Code style

- Lint/format/import-ordering is enforced by **Biome** (`biome.jsonc`): 2-space indent, single quotes, semicolons always, trailing commas, 100-col width, LF endings, auto import organization.
- TypeScript is `strict`. Keep new code type-clean — `yarn lint` runs `tsc --noEmit` against each workspace.
- Prefer the existing patterns (Emotion `styled`/`sx` + the `theme`, jotai atoms, the `@@frontend/components` and `@@frontend/elements` barrels) over introducing new conventions.
- Never try to format code or organise imports manually, and never read the Biome configuration (`biome.jsonc`) by hand to figure out the rules.
- To fix Biome errors (lint/format/import-ordering), apply the autofix first: run `yarn biome check --write`. Only after the autofix has been applied, resort to manual editing for whatever the autofix could not fix.
- Do not add a test framework unless asked; `yarn lint` is the verification gate.
- Do not add comments in code unless asked.

## Deployment

- This site is deployed to **Cloudflare Pages**, configured directly in the Cloudflare dashboard and driven by pushes to the git repository.
- **Never create a Wrangler configuration file** (e.g. `wrangler.jsonc` / `wrangler.toml`); deployment is configured from the git repository, not from a local Wrangler config.

## Conventions to respect

- Server-only logic uses the `*.server.tsx` / `*.server.ts` file suffix convention; keep server-only imports (e.g. `node:fs`) out of client bundles.
- The Vite build config (plugins, `resolve.alias`, `build.outDir`) lives in `packages/frontend/vite.config.ts`; the React Router app config (`appDirectory`, `ssr`, `prerender`) lives in `packages/frontend/react-router.config.ts`.
- The frontend `.gitignore` excludes `build/` and `.react-router/`; the root `.gitignore` excludes `node_modules/`. Don't commit build output.
- React components can accept other React components as children (and vice versa).
