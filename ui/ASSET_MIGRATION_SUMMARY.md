# Asset Migration Summary

Date: 2026-02-23

## Outcome

- Asset runtime layout was reorganized into:
  - `ui/public/assets/base/...`
  - `ui/public/assets/seafarers/...`
  - `ui/public/assets/cities-knights/...`
  - `ui/public/assets/shared/...`
- Source/edit artifacts were moved out of public runtime paths into:
  - `ui/assets/source/...`
  - `ui/assets/source/legacy-runtime-candidates/...`

## Validation

- `npm run lint`: pass (1 pre-existing warning in `ui/components/playerList.tsx`)
- `npm test`: pass
- `npm run build`: pass
- Referenced asset integrity check: all referenced assets exist on disk.

## Remaining Open Items

- Manual smoke check in-app for key flows:
  - Base board rendering and card interactions
  - Seafarers ship/pirate/fog flows
  - Cities and Knights knight/barbarian/improvement UI flows
- Decide whether to keep avatar files as documented dynamic exceptions (recommended).

## Commit Readiness Notes

- The branch is technically buildable and testable.
- Before commit, run one manual playthrough smoke pass and then finalize staging.
