# AGENTS.md

Guidance for AI coding agents working in `@furtherland/frontend-v5`.

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

The **v5 frontend** (`@furtherland/frontend-v5`) — a rebuild of furtherland on **TanStack Start** (Vite-based, SSR) + **TanStack Router** (file-based routing) + **React 19**. It is a workspace in this Yarn 4 monorepo and the planned replacement for the Astro-based v4 frontend (`@furtherland/frontend`). Styling is hand-written CSS using custom properties in `src/styles.css` (Tailwind has been removed).

## Commands

Run from `packages/frontend-v5/` via `yarn`. There is **no test suite**; Biome is the verification gate.

| Command | What it does |
| --- | --- |
| `yarn dev` | Dev server (Vite) on port 3000. |
| `yarn build` | Production build (Vite). |
| `yarn preview` | Serves the production build locally. |
| `yarn generate-routes` | Regenerates `src/routeTree.gen.ts` from `src/routes/**` (`tsr generate`). **Run this after adding / renaming / removing a route.** |
| `yarn lint` / `yarn check` / `yarn format` | Biome lint / full check / format. |

## Routing

File-based, under `src/routes/**` (`tsr.config.json` sets `target: react`). `src/routeTree.gen.ts` is **generated** — do not edit it by hand. Add or rename a file under `src/routes/`, then run `yarn generate-routes`. `src/router.tsx` builds the router (and declares the `Register` module for type-safe navigation); `src/routes/__root.tsx` is the root route / document shell (head, theme init script, `<Header>` / `<Footer>`, devtools).

## Path aliases

`tsconfig.json` maps `@@frontend-v5/*` → `./src/*` (enabled in Vite via `resolve.tsconfigPaths`). Use this alias for cross-directory imports instead of deep relative paths.

## Running intent skill commands

This package's skill allowlist (`intent.skills: ["@tanstack/*"]`) lives in this package's `package.json`. As in the root `AGENTS.md`, set `YARN_GLOBAL_FOLDER` to the project root's `.yarn/berry` via an **absolute** path — `$(git rev-parse --show-toplevel)/.yarn/berry` — never a relative one. From this directory, run:

```bash
YARN_GLOBAL_FOLDER=$(git rev-parse --show-toplevel)/.yarn/berry yarn dlx @tanstack/intent@latest list
YARN_GLOBAL_FOLDER=$(git rev-parse --show-toplevel)/.yarn/berry yarn dlx @tanstack/intent@latest load <package>#<skill>
```

Run `list` from **this** directory to scope to `@tanstack/*`; running it from the repo root instead surfaces the whole workspace (a few extra non-`@tanstack` packages such as `get-tsconfig`).
