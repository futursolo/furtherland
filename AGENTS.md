# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A personal blog ("furtherland") built on **TanStack Start** (Vite-based, SSR) + **TanStack Router** (file-based routing) + **React 19**, styled with **Emotion** (a `theme` object in `src/providers/theme.tsx` consumed by the `ThemeProvider` and by `styled`/`sx`), client state via **jotai**, and **MDX** for content. It is a Yarn monorepo (node linker: `pnp`). Content is authored as MDX files and loaded by the app; the app is SSR by default, with a small set of routes (the Atom feed, `robots.txt`, and the sitemap) prerendered to static files at build time.

## Package manager

- **Yarn 4** via **corepack**. Run `corepack enable` once if `yarn` is not available.
- Always set environment variable `YARN_GLOBAL_FOLDER` to the **project root's** `.yarn/berry` (the `.yarn` directory that sits next to `.git` at the repo root) before running yarn. Point it at the **absolute** path of that directory (e.g. `$(git rev-parse --show-toplevel)/.yarn/berry`), never a relative `.yarn/berry` — a relative value is resolved against the current workspace directory, which creates stray `.yarn/` folders inside `packages/*` and can exhaust disk space.
- Always invoke dependencies through `yarn` (e.g. `yarn vite dev`), never `npx`/directly.
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
| `yarn dev` | Vite dev server on port 1741 (`yarn workspace @furtherland/frontend frontend:dev`). |
| `yarn build` | Production build (`yarn workspace @furtherland/frontend frontend:build`): prerenders the selected routes to static files under `build/client`. |
| `yarn preview` | Serves the `build/` output locally (`yarn workspace @furtherland/frontend frontend:preview`). |
| `yarn generate-routes` | Regenerates `packages/frontend/src/routeTree.gen.ts` from `src/routes/**` (`tsr generate`). **Run this after adding / renaming / removing a route.** |

Package scripts that shell out to a dependency (e.g. `vite`, `tsr`) must be run through `yarn` from the owning package directory (e.g. `yarn frontend:dev` from `packages/frontend`).

## Monorepo layout

- `packages/frontend/` — the app (`@furtherland/frontend`), a TanStack Start (Vite) project. The routes (`src/routes/**`), router (`src/router.tsx`), generated `src/routeTree.gen.ts`, layouts, components, elements, providers, atoms, and utils live here, alongside the content loaders (`src/content/**`) and the `vite.config.ts` build config.
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

File-based via TanStack Router, under `packages/frontend/src/routes/**`. `src/routeTree.gen.ts` is **generated** — do not edit it by hand; add or rename a file under `src/routes/`, then run `yarn generate-routes`. `src/router.tsx` builds the router (and declares the `Register` module for type-safe navigation); `src/routes/__root.tsx` is the root route / document shell (head, theme init script, `<Header>` / `<Footer>`). Dynamic routes (posts, pages) look their content up by slug at request time.

## Rendering / build output

The app is **SSR** (TanStack Start / Vite). A small set of routes — the Atom feed (`/atom.xml`), `/robots.txt`, and the sitemap (`/sitemap-index.xml`, `/sitemap-0.xml`) — are explicitly **prerendered** to static files under `build/client/` at build time (see the `tanstackStart({ pages, prerender })` block in `vite.config.ts`); everything else is served from Node.

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

## Deployment

- This site is deployed to **Cloudflare Pages**, configured directly in the Cloudflare dashboard and driven by pushes to the git repository.
- **Never create a Wrangler configuration file** (e.g. `wrangler.jsonc` / `wrangler.toml`); deployment is configured from the git repository, not from a local Wrangler config.

## Conventions to respect

- Server-only logic uses the `*.server.tsx` / `*.server.ts` file suffix convention; keep server-only imports (e.g. `node:fs`) out of client bundles.
- The Vite build config (plugins, `resolve.alias`, the `tanstackStart` prerender block, `build.outDir`) lives in `packages/frontend/vite.config.ts`.
- The frontend `.gitignore` excludes `build/` and `.tanstack/`; the root `.gitignore` excludes `node_modules/`. Don't commit build output.
- React components can accept other React components as children (and vice versa).
