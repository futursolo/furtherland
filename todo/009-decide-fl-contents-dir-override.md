# Decide: carry over the `FL_CONTENTS_DIR` override

- **Status:** 🟠 MISSING (decision)
- **Priority:** high
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Content config

## Context

v4's `astro.config.ts:47-51` resolved the content-collection base path from an overridable
`FL_CONTENTS_DIR` env var (defaulting to the repo `contents/` dir). v5 **hardcodes**
`@@contents` → `../contents/src` (`vite.config.ts:31`) and dropped the override. (Both frontends
currently read the *same* physical dir `packages/contents/src`, so there is no immediate break — but
the override capability is gone.)

## Action (decide)

- [ ] Decide whether to carry the `FL_CONTENTS_DIR` override into v5.
- [ ] If yes, make the v5 contents base path env-overridable (resolved against `process.cwd()` when
  set, mirroring v4) in `vite.config.ts`.

## References

- `packages/frontend-v5/vite.config.ts:31`
- v4 counterpart: `packages/frontend/astro.config.ts:47-51`
