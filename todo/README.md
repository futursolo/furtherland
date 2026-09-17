# v5 Migration TODOs

Individual, actionable tasks split out of [`TODOs.md`](../TODOs.md) — the behavioral-difference
audit of `frontend` (v4, Astro) vs `frontend-v5` (v5, TanStack Start). Each file is one task with a
status tag, the context, a concrete action, and `file:line` references.

**Status tags** (from `TODOs.md`)
- 🔴 **GAP/BUG** — v5 behaves differently / is broken; fix to match v4.
- 🟠 **MISSING** — v4 behavior with no v5 counterpart; (re)implement.
- 🟡 **DECIDE** — ambiguous; a keep/replace/delete decision is needed.
- ⚪ **CLEANUP** — dead/stale code in v5.
- ⚠️ **drift risk** — currently identical, but a change invites the two to diverge.

🔵 **NOTE** items (intentional framework changes, aware-only, no action) are deliberately **not**
split into tasks.
