---
name: yarn-peer-deps
description: Use when `yarn install` / `yarn explain peer-requirements` reports peer dependency warnings in a Yarn 2+ / Berry project (codes YN0086, "doesn't provide <pkg>", "peer dependencies are incorrectly met"). Fixes them via `packageExtensions` in `.yarnrc.yml`, and via `package.json` for workspace-level providers.
---

# Yarn Peer Dependency Warnings

Silence Yarn peer dependency warnings by making the offending package actually
provide the missing peer. Two different fixes depending on *who* is the provider.

## 1. Reproduce and enumerate

Run the project's install command (respect any repo-specific env vars from its
AGENTS.md, e.g. `YARN_GLOBAL_FOLDER`). Watch for `Done with warnings` / `YN0086`.

Then list only the real failures:

```bash
yarn explain peer-requirements | grep -F '✘'
```

- `✘` = a peer is required but missing → **fix these**.
- `✓` = an optional peer, correctly absent → **leave alone**.

For each `✘` hash, inspect the provider → consumer chain:

```bash
yarn explain peer-requirements <hash>
```

## 2. Pick the fix from the provider type

Each failing line reads `X doesn't provide Y to Z`. Look at **X, the provider**:

- **X is a workspace** (`@scope/name@workspace:...`) → add `Y` to that
  workspace's `package.json` under `dependencies`. (`packageExtensions` cannot
  extend a workspace.)
- **X is an npm package** (`name@npm:version`) → add a `packageExtensions`
  entry in `.yarnrc.yml` giving that package the missing `Y`.

The two warning flavors map directly:

- `incorrectly met by your project` → provider is a workspace → `package.json`.
- `incorrectly met by dependencies` → provider is a transitive npm package →
  `packageExtensions`.

## 3. Edit `.yarnrc.yml`

```yaml
packageExtensions:
  '<provider-pkg>@<version-range>':
    dependencies:
      '<missing-peer>': '<range>'
```

- Key = the **provider** package name plus a version selector. Use a versioned
  range matching the resolved version (e.g. `@foo/bar@^1.2.3`); `*` also works.
- Add the missing peer under `dependencies` — that is what makes the provider
  satisfy the peer for its dependents.
- Prefer version ranges **already resolved in `yarn.lock`** so the lockfile diff
  stays minimal and you avoid introducing new version conflicts.
- One provider missing several peers → several keys under it. Several providers
  → several top-level keys.

## 4. Verify

```bash
yarn install                              # expect "Done" (not "Done with warnings")
yarn explain peer-requirements | grep -F '✘'   # expect no output
```

Re-running `yarn install` is what applies `packageExtensions` and updates the
lockfile. Then run the repo's lint/build gate.

## Gotchas

- Only touch providers that emit `✘`; do not "fix" `✓` optional peers.
- A peer declared `optional` (via `peerDependenciesMeta`) will not warn.
- `overrides` in `.yarnrc.yml` forces a *different version* of an existing
  dependency — use that for version-mismatch warnings, not for adding missing
  providers.
