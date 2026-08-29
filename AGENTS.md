# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A personal blog / static-site project ("furtherland") built with **Astro** (`output: 'static'`), **React 19** (rendered as islands via `@astrojs/react`), styled with **Emotion**, client state via **nanostores**, and **MDX** for content. It is a Yarn monorepo (node linker: `pnpm`). Pages are authored as Astro `.astro` files that wrap React islands; content is authored as MDX files and prerendered at build time.

## Package manager

- **Yarn 4** via **corepack**. Run `corepack enable` once if `yarn` is not available.
- Always set environment variable `YARN_GLOBAL_FOLDER` to .yarn/berry in this repository before running yarn.
- Always invoke dependencies through `yarn` (e.g. `yarn astro dev`), never `npx`/directly.
- It is OK to install Node, Yarn (via corepack), and any missing dependencies (via `yarn install`) in the current environment to be able to run the project.
- When adding or updating dependencies, do **not** look up or read version numbers (e.g. via `yarn info <pkg> version` or the registry) unless absolutely necessary — just run `yarn add <pkg>` for new dependencies or `yarn up <pkg>` to update existing ones.

## Git workflow

- **Always inspect the current branch before making changes** (e.g. `git branch --show-current` and `git status`).
- **If the current branch is `main`, always start a new branch first** before doing any work (e.g. `git switch -c <branch-name>` or `git checkout -b <branch-name>`). Do not make changes or commit directly on `main`.
- Choose a descriptive branch name derived from the task (e.g. `fix/<summary>`, `feat/<summary>`).
- If a suitable non-`main` branch already exists and the work belongs there, continue on it; otherwise create a new one.

## Commands

Run from the **repository root** unless noted. There is **no test suite**.

| Command | What it does |
| --- | --- |
| `yarn lint` | Runs `scripts/lint.sh`: `biome check` (lint + format + import order, per `biome.jsonc`) then `tsc --project packages/frontend/tsconfig.json --noEmit`. This is the main verification step after any change. |
| `yarn frontend:start` | Run from `packages/frontend`. Dev server (`yarn astro dev`). |
| `yarn frontend:build` | Run from `packages/frontend`. Production build (`yarn astro build`): prerenders every route to static HTML under `build/client`. |
| `yarn frontend:serve` | Run from `packages/frontend`. Serves the `build/client` output on port 1741 (via `serve.json`). |

Because of the pnpm-style node-modules layout, package scripts that shell out to a dependency (e.g. `astro`, `serve`) must be run through `yarn` from the owning package directory.

## Monorepo layout

- `packages/frontend/` — the Astro app (`@furtherland/frontend`). Pages, layouts, React components, atoms, providers, the `src/content.config.ts` content-collection config, and the `astro.config.ts` build config all live here.
- `contents/` — author-facing MDX content, **outside** the package `src` trees:
  - `contents/posts/<YYYY-MM-DD>/<slug>.mdx` — blog posts.
  - `contents/pages/` — standalone pages.
- `biome.jsonc`, root `tsconfig.json`, `scripts/` — repo-level tooling.

### Path aliases

Defined in the package's `tsconfig.json` (and wired into the Vite build via `astro.config.ts` `vite.resolve.alias`):
- `@@frontend/*` → `packages/frontend/src/*`

Use these aliases for cross-directory imports rather than deep relative paths.

## Routing

File-based routing via Astro's `src/pages/**` directory. Each page is a `.astro` file that wraps a React island (e.g. `src/pages/index.astro` → `src/components/HomePage.tsx`). All pages share `src/layouts/BaseLayout.astro` (html/head/body + `<Meta>` + theme preload script + `<Providers>`/`<RootLayout>`). React navigation uses `astro:react` (`Link`, `useLocation`).

## Static output

`astro.config.ts` sets `output: 'static'`, so Astro prerenders every route to static HTML at build time. Dynamic routes (blog posts) are expanded at build via `getStaticPaths` (see "Prerendering"). Each page renders its React content as an island with `client:load` — the island hydrates after first paint (the theme preload script in `BaseLayout.astro` runs before hydration, matching the old `suppressHydrationWarning` behavior).

`import.meta.projectDir` is the repo root, and `import.meta.contentsDir` is the contents directory — both injected in `astro.config.ts` (`vite.define`) and typed in `src/vite-env.d.ts`. The content-collection base path is resolved from `contentsDir` (see `src/content.config.ts`).

`contentsDir` defaults to the repo's `contents/` directory. It can be overridden with the `FL_CONTENTS_DIR` env var; when set, the value is resolved relative to the cwd of the `yarn` command that runs the build (i.e. `process.cwd()`), rather than the repo root.

## Prerendering

Astro prerenders all routes at build. Blog post URLs are not hard-coded — `src/pages/posts/[slug].astro` provides a `getStaticPaths` that iterates the `posts` content collection (one path per non-draft post) to expand the post URL list. If you add a new dynamic route (e.g. a new content type), give its page a matching `getStaticPaths`.

## Content (MDX) conventions

- Posts live at `contents/posts/<YYYY-MM-DD>/<slug>.mdx` and must carry YAML frontmatter: `title`, `date`, `slug`, and optional `description`.
- The `slug` must match the file name, and the `date` frontmatter must match the containing directory name — this keeps the URL (`/posts/<slug>`) and the on-disk path (`contents/posts/<date>/<slug>.mdx`) in sync, which is what the glob content loader relies on.
- **Drafts**: a post with `date: '2099-12-31'` is treated as a draft (`isDraft`) and is excluded in production builds (`Astro.build`). See `contents/posts/2099-12-31/test.mdx`.
- MDX is processed with Astro's native MDX integration (`@astrojs/mdx` in `astro.config.ts`); frontmatter is read via Astro content collection.
- Frontmatter is validated with **zod**; invalid frontmatter throws.

## Code style

- Lint/format/import-ordering is enforced by **Biome** (`biome.jsonc`): 2-space indent, single quotes, semicolons always, trailing commas, 100-col width, LF endings, auto import organization.
- TypeScript is `strict`. Keep new code type-clean — `yarn lint` runs `tsc --noEmit` against the frontend project.
- Prefer the existing patterns (styled components via `@@frontend/utils`, nanostores atoms, the `@@frontend/components` barrel) over introducing new conventions.
- To fix Biome errors (lint/format/import-ordering), run `yarn biome check --write` rather than editing files by hand.
- Do not add a test framework unless asked; `yarn lint` is the verification gate.

## Deployment

- This site is deployed to **Cloudflare Pages**, configured directly in the Cloudflare dashboard and driven by pushes to the git repository.
- **Never create a Wrangler configuration file** (e.g. `wrangler.jsonc` / `wrangler.toml`); deployment is configured from the git repository, not from a local Wrangler config.

## Conventions to respect

- Server-only logic uses the `*.server.tsx` / `*.server.ts` file suffix convention; keep server-only imports (e.g. `node:fs`) out of client bundles.
- The Astro build config (`output`, the native MDX integration, `projectDir` define, `outDir`) lives in `packages/frontend/astro.config.ts`.
- The frontend `.gitignore` excludes `build/` and `.astro/`; the root `.gitignore` excludes `node_modules/` (pnpm-style layout). Don't commit build output.
- React Components can accept Astro Components as children, vice versa.
