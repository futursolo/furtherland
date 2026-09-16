# AGENTS.md

Guidance for AI coding agents working in `packages/frontend` (`@furtherland/frontend`).

## What this is

This is the **legacy** version of the frontend. The current v5 frontend lives in `packages/frontend-v5`. The root `AGENTS.md` still documents this package's layout, routing, and conventions, which remain accurate for this legacy frontend.

## Node linker

This package **requires the `pnpm` node linker** to run or build, whereas the rest of the monorepo uses the default **`pnp`** node linker (see the root `.yarnrc.yml`).

If you need to run **any command from this package** or **build it** (e.g. `yarn astro dev`, `yarn astro build`), you must **temporarily switch Yarn to the `pnpm` node linker**, and then **revert back to `pnp`** once you are done.

To do this, edit the root `.yarnrc.yml`:

1. Change `nodeLinker: pnp` to `nodeLinker: pnpm` and run `yarn install` to apply it.
2. Do your work (run / build / etc.) from `packages/frontend`.
3. Change `nodeLinker` back to `pnp` and run `yarn install` again to restore the default.

**Always revert the node linker back to `pnp` when you are finished** — do not leave it set to `pnpm`. Keep the `.yarnrc.yml` change out of any commit unless you intend to keep it.
