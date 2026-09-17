# Review minor theme-object diffs (`fontSizes` ladder, generic `sans-serif`)

- **Status:** ⚪ CLEANUP / 🔵 NOTE
- **Priority:** low
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Theme representation

## Context

All 14 `--fl-theme-*` values and the `html, body` base rules are **value-for-value identical**
between v4 and v5 (🔵). Two minor v5-only diffs remain:
- v5 adds a `fontSizes` ladder (v4 SCSS had none).
- v5 inserts a second generic `sans-serif` into the font stack (`theme.tsx:83-85`).

These are low-impact but represent v5-only behavior not present in v4.

## Action

- [ ] Review whether the extra `fontSizes` ladder and the added generic `sans-serif` fallback are
  intentional; keep or trim to match v4.

## References

- `packages/frontend-v5/src/providers/theme.tsx:83-85`
- `packages/frontend-v5/src/theme.d.ts`
