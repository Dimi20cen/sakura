# Asset Cleanup Proposal (No Changes Applied)

Date: 2026-02-23

This proposal defines the next cleanup pass after the mode-folder migration.
It is a planning document only.

## Goals

- Move remaining cross-mode runtime assets into `assets/shared/...`.
- Move source/edit artifacts out of `ui/public/assets/...`.
- Keep all runtime references valid with staged, reversible changes.

## Current Gaps

- Shared runtime assets still at top-level `assets/`:
  - `assets/buttons/*`
  - `assets/dice/*`
  - `assets/robber.png`
  - `assets/bank.png`
  - `assets/settings.png`
  - `assets/bot.png`
  - `assets/spectate.png`
  - `assets/timing-rules.png`
- Source/edit artifacts are still under public runtime folders:
  - `.pdn` files
  - `.svg` source files
  - legacy helper images (`original.png`, etc.)

## Proposed Target Layout

- `ui/public/assets/shared/ui/` for global UI images (`settings`, `bot`, `spectate`, `timing-rules`, logos/backgrounds).
- `ui/public/assets/shared/buttons/` for action buttons and button backgrounds.
- `ui/public/assets/shared/dice/` for white/red/event dice runtime images.
- `ui/assets/source/...` for non-runtime source/edit files (`.pdn`, `.svg`, and optional legacy refs).

## Proposed Move Map

### Shared runtime moves

- `ui/public/assets/buttons/* -> ui/public/assets/shared/buttons/*`
- `ui/public/assets/dice/dice-*.png -> ui/public/assets/shared/dice/dice-*.png`
- `ui/public/assets/dice/event-*.png -> ui/public/assets/shared/dice/event-*.png`
- `ui/public/assets/robber.png -> ui/public/assets/shared/ui/robber.png`
- `ui/public/assets/bank.png -> ui/public/assets/shared/ui/bank.png`
- `ui/public/assets/settings.png -> ui/public/assets/shared/ui/settings.png`
- `ui/public/assets/bot.png -> ui/public/assets/shared/ui/bot.png`
- `ui/public/assets/spectate.png -> ui/public/assets/shared/ui/spectate.png`
- `ui/public/assets/timing-rules.png -> ui/public/assets/shared/ui/timing-rules.png`

### Source/edit extraction moves (out of public)

- `ui/public/assets/**/**/*.pdn -> ui/assets/source/**/**/*.pdn`
- `ui/public/assets/dice/*.svg -> ui/assets/source/dice/*.svg`
- Optional legacy non-runtime refs:
  - `ui/public/assets/base/tokens/ports/original.png`
  - `ui/public/assets/base/tokens/ports/port.png`
  - `ui/public/assets/cities-knights/pieces/knight/original.png`
  - `ui/public/assets/cities-knights/pieces/knight/old.pdn`
  - `ui/public/assets/cities-knights/pieces/knight/redpdn_new.pdn`

## Execution Plan (staged)

1. Stage A: Shared buttons + dice
- Move files.
- Update imports in `ui/src/assets.ts`.
- Run `npm run lint` and `npm test`.

2. Stage B: Shared global UI images
- Move files.
- Update imports/string paths in:
  - `ui/src/assets.ts`
  - `ui/components/game.tsx`
  - `ui/components/playerList.tsx`
- Run `npm run lint` and `npm test`.

3. Stage C: Source/edit extraction
- Move `.pdn`/`.svg`/legacy source-only files from `public` to `ui/assets/source`.
- Confirm no runtime references point to moved source files.
- Run `npm run lint` and `npm test`.

## Validation Checklist

- [ ] No missing assets in static imports.
- [ ] No missing assets in runtime string paths (`/assets/...`).
- [ ] Lint passes (existing known warnings acceptable).
- [ ] Tests pass.
- [ ] `ui/assets/mappings.json` updated for legacy path hints.
- [ ] `ui/ASSET_MIGRATION_CHECKLIST.md` move log updated.

## Risk Notes

- Dynamic paths (for avatars) are already under `shared`, but any future dynamic lookup additions should be explicitly audited.
- Moving dice assets requires careful update of all dice imports and event dice usage.
- Source extraction should happen only after confirming those files are not consumed by runtime.
