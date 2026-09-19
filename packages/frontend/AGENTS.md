# AGENTS.md

Guidance for AI coding agents working in `@furtherland/frontend`.

## What this is

The **frontend** (`@furtherland/frontend`) — a rebuild of furtherland on **React Router** (v8, framework mode — Vite-based, SSR) + **React 19**. It is a workspace in this Yarn 4 monorepo. Styling is Emotion-based: a `theme` object in `src/providers/theme.tsx` is consumed by the `ThemeProvider` and by `styled`/`sx` (from `@@frontend/utils`), and global CSS (the `--fl-theme-*` custom properties plus base `html, body` rules) is injected by the provider's Emotion `<Global>`. Tailwind has been removed.

## Commands

Run from `packages/frontend/` via `yarn`. There is **no test suite**; Biome is the verification gate.

| Command | What it does |
| --- | --- |
| `yarn frontend:start` | Dev server (`react-router dev`, Vite) on port 1741. |
| `yarn frontend:build` | Production build (`react-router build`, Vite). |
| `yarn frontend:preview` | Serves the production build locally (`react-router-serve`). |
| `yarn frontend:typegen` | Regenerates the route types under `.react-router/` (`react-router typegen`). Runs automatically in dev and via `yarn lint`; run it after adding / renaming / removing a route. |
| `yarn lint` (from the repo root) | The verification gate: `biome check` plus `tsc --noEmit` across workspaces (see `scripts/lint.sh`). |

## Routing

Routes are declared in `src/routes.ts` using `route()` / `index()` / `layout()` from `react-router`; each route module under `src/routes/**` exports a `default` component plus `loader` / `meta` (the root module, `src/root.tsx`, adds the document `Layout`, `meta`, and `links`). Typed route params / `loaderData` come from generated `+types` modules under `.react-router/` (imported in each route as `./+types/<id>`), produced by `react-router typegen`. `src/root.tsx` is the root module / document shell (head, theme init script, `<Header>` / `<Footer>`).

## Path aliases

`tsconfig.json` maps `@@frontend/*` → `./src/*`; the Vite build defines the same alias via `resolve.alias` in `vite.config.ts` (with `resolve.tsconfigPaths` also enabled). Use this alias for cross-directory imports instead of deep relative paths.
