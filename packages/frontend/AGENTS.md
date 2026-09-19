# AGENTS.md

Guidance for AI coding agents working in `@furtherland/frontend`.

<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `yarn dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `yarn dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## What this is

The **frontend** (`@furtherland/frontend`) — a rebuild of furtherland on **TanStack Start** (Vite-based, SSR) + **TanStack Router** (file-based routing) + **React 19**. It is a workspace in this Yarn 4 monorepo. Styling is Emotion-based: a `theme` object in `src/providers/theme.tsx` is consumed by the `ThemeProvider` and by `styled`/`sx` (from `@@frontend/utils`), and global CSS (the `--fl-theme-*` custom properties plus base `html, body` rules) is injected by the provider's Emotion `<Global>`. Tailwind has been removed.

## Commands

Run from `packages/frontend/` via `yarn`. There is **no test suite**; Biome is the verification gate.

| Command | What it does |
| --- | --- |
| `yarn frontend:start` | Dev server (Vite) on port 1741. |
| `yarn frontend:build` | Production build (Vite). |
| `yarn frontend:preview` | Serves the production build locally. |
| `yarn frontend:generate-routes` | Regenerates `src/routeTree.gen.ts` from `src/routes/**` (`tsr generate`). **Run this after adding / renaming / removing a route.** |
| `yarn lint` (from the repo root) | The verification gate: `biome check` plus `tsc --noEmit` across workspaces (see `scripts/lint.sh`). |

## Routing

File-based, under `src/routes/**` (`tsr.config.json` sets `target: react`). `src/routeTree.gen.ts` is **generated** — do not edit it by hand. Add or rename a file under `src/routes/`, then run `yarn frontend:generate-routes`. `src/router.tsx` builds the router (and declares the `Register` module for type-safe navigation); `src/routes/__root.tsx` is the root route / document shell (head, theme init script, `<Header>` / `<Footer>`, devtools).

## Path aliases

`tsconfig.json` maps `@@frontend/*` → `./src/*`; the Vite build defines the same alias via `resolve.alias` in `vite.config.ts` (with `resolve.tsconfigPaths` also enabled). Use this alias for cross-directory imports instead of deep relative paths.

## Running intent skill commands

This package's skill allowlist (`intent.skills: ["@tanstack/*"]`) lives in this package's `package.json`.

From this directory, run:

```bash
yarn dlx @tanstack/intent@latest list
yarn dlx @tanstack/intent@latest load <package>#<skill>
```

Run `list` from **this** directory to scope to `@tanstack/*`; running it from the repo root instead surfaces the whole workspace (a few extra non-`@tanstack` packages such as `get-tsconfig`).
