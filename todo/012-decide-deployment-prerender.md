# Decide deployment / prerender strategy (static v4 → on-demand SSR v5)

- **Status:** 🔵/🟠 DECIDE
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #8; §1 Framework/architecture shift

## Context

v4 (`frontend`) builds with `output: 'static'` and prerenders every route to static files under
`build/client`. v5 uses Vite + `tanstackStart()` with **no prerender configured**
(`vite.config.ts`), so it ships a Start SSR server + client assets and renders routes **on demand**.

The root `AGENTS.md` deploys to **Cloudflare Pages**. v4's static output deploys trivially; v5
(SSR, no prerender) needs the TanStack Start **Cloudflare adapter** — a plain static Pages deploy of
v5 would not run the SSR server.

## Action (decide)

- [ ] Decide the deployment model:
  - (a) deploy v5 as **SSR Workers** (add the TanStack Start Cloudflare Pages adapter), **or**
  - (b) configure TanStack Start **prerender** for the post/page families to recover v4's static behavior.
- [ ] Apply the decision: add the adapter / configure prerender, and update the Cloudflare Pages
  build settings accordingly.
- [ ] Do **not** create a Wrangler config file (deployment is configured from the git repo, not a
  local Wrangler config) — see root `AGENTS.md` → Deployment.

## References

- `packages/frontend-v5/vite.config.ts` (no prerender configured)
- v4 counterpart: `packages/frontend/astro.config.ts:35` (`output: 'static'`)
- Root `AGENTS.md` → Deployment (Cloudflare Pages; never a Wrangler config)
