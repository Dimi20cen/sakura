# Asset Stale Report (No Deletions)

Date: 2026-02-23

## Method

- Built a set of runtime-referenced assets from:
  - static imports to `../public/assets/...` in `ui/src`, `ui/components`, `ui/pages`
  - string paths like `"/assets/..."` in `ui/src`, `ui/components`, `ui/pages`
- Compared against all files under `ui/public/assets`.

## Totals

- Referenced assets: `204`
- Files in `ui/public/assets`: `234`
- Unreferenced by static/path scan: `30`

## Categories

### Likely dynamic-use (keep)

These are loaded via dynamic avatar path construction in `ui/src/state.ts` and are expected:

- `/assets/shared/avatars/blue/{1..5}.jpg`
- `/assets/shared/avatars/cyan/{1..5}.jpg`
- `/assets/shared/avatars/green/{1..5}.jpg`
- `/assets/shared/avatars/plum/{1..5}.jpg`
- `/assets/shared/avatars/red/{1..5}.jpg`
- `/assets/shared/avatars/yellow/{1..5}.jpg`

Count: `30`

## Recommendation

1. Keep avatar files as active dynamic assets.
2. Treat this file set as expected dynamic exceptions in future static-reference audits.
3. Legacy candidates were already moved to `ui/assets/source/legacy-runtime-candidates/`.
