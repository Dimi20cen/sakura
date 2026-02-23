# Asset Public Directory Migration Checklist

This document tracks goals, planned moves, and completed steps for improving
the `ui/public/assets` structure.

## Goals

- Make asset paths easier to understand and maintain.
- Separate assets by expansion (`base`, `seafarers`, `cities-knights`) and shared use.
- Keep migration safe: small batches, no broken runtime references.
- Standardize how agents report dry-run/apply changes.

## Target Structure (high level)

- `ui/public/assets/base/...`
- `ui/public/assets/seafarers/...`
- `ui/public/assets/cities-knights/...`
- `ui/public/assets/shared/...`

## Migration Rules

- Move assets in small, reversible batches.
- Update code references in the same step as each move.
- Keep old-to-new mappings documented.
- Validate after each batch before continuing.

## Checklist

### Planning

- [x] Confirm folder taxonomy and naming conventions.
- [x] Create initial `ui/assets/mappings.json` for recurring routes.
- [x] Group current assets into: base, seafarers, cities-knights, shared.

### Batch 1: Shared Assets

- [x] Move profile icons, avatars, common icons, and audio to `shared/`.
- [x] Update all references to new shared paths.
- [ ] Verify UI pages/components loading those assets.

### Batch 2: Seafarers Assets

- [x] Move ship/pirate/sea-specific assets to `seafarers/`.
- [x] Update `ui/src/assets.ts` and other direct references.
- [ ] Verify ship and sea rendering paths.

### Batch 3: Cities and Knights Assets

- [x] Move knight, merchant, barbarian, metropolis/wall assets to `cities-knights/`.
- [x] Update imports and runtime string paths.
- [ ] Verify CK-specific flows (knights, barbarian track, event dice if applicable).

### Batch 4: Base Assets

- [x] Move base tiles, roads, settlements/cities, number tokens, ports, cards.
- [x] Update imports and runtime string paths.
- [ ] Verify board rendering and card displays.

### Cleanup

- [x] Remove stale/unused duplicates after references are fully migrated.
- [x] Keep source/edit files out of public runtime paths where possible.
- [x] Update `ui/ASSET_SPEC.md` with finalized structure examples.

### Validation

- [x] Run lint/tests used by this repo for UI changes.
- [ ] Do a manual smoke check for key game screens.
- [x] Write a short migration summary (what moved, what remains, risks).
- Smoke procedure file: `ui/ASSET_SMOKE_CHECKLIST.md`

## Move Log

Use this section to document each concrete move as it happens.

### 2026-02-23

- Created migration checklist and staged plan.
- Moved runtime shared asset folders:
  - `ui/public/assets/profile-icons -> ui/public/assets/shared/profile-icons`
  - `ui/public/assets/avatars -> ui/public/assets/shared/avatars`
  - `ui/public/assets/icons -> ui/public/assets/shared/icons`
  - `ui/public/assets/sound -> ui/public/assets/shared/sound`
- Updated code references:
  - `ui/pages/choose-profile.tsx`
  - `ui/components/header.tsx`
  - `ui/src/state.ts`
  - `ui/src/assets.ts`
- Verified no remaining references to old shared paths via ripgrep.
- Moved Seafarers runtime assets:
  - `ui/public/assets/ships/ship-token.png -> ui/public/assets/seafarers/pieces/ships/ship-token.png`
  - `ui/public/assets/pirate.png -> ui/public/assets/seafarers/pieces/pirate.png`
  - `ui/public/assets/sea.jpg -> ui/public/assets/seafarers/board/sea.jpg`
  - `ui/public/assets/tile-tex/sea.webp -> ui/public/assets/seafarers/textures/sea.webp`
  - `ui/public/assets/tile-tex/fog.jpg -> ui/public/assets/seafarers/textures/fog.jpg`
  - `ui/public/assets/tile-tex/island-l.png -> ui/public/assets/seafarers/textures/island-l.png`
  - `ui/public/assets/tile-tex/island-r.png -> ui/public/assets/seafarers/textures/island-r.png`
  - `ui/public/assets/tile-tex/beach.png -> ui/public/assets/seafarers/textures/beach.png`
- Updated Seafarers imports in `ui/src/assets.ts`.
- Verified no remaining references to old Seafarers paths via ripgrep.
- Ran `npm run lint` in `ui` (passes with one existing warning in `ui/components/playerList.tsx`).
- Moved Cities and Knights runtime assets:
  - `ui/public/assets/knight -> ui/public/assets/cities-knights/pieces/knight`
  - `ui/public/assets/merchant -> ui/public/assets/cities-knights/pieces/merchant`
  - `ui/public/assets/barbarian/track.png -> ui/public/assets/cities-knights/board/barbarian/track.png`
  - `ui/public/assets/barbarian/ship.png -> ui/public/assets/cities-knights/board/barbarian/ship.png`
  - `ui/public/assets/city/m-6.png -> ui/public/assets/cities-knights/city-improvements/m-6.png`
  - `ui/public/assets/city/m-7.png -> ui/public/assets/cities-knights/city-improvements/m-7.png`
  - `ui/public/assets/city/m-8.png -> ui/public/assets/cities-knights/city-improvements/m-8.png`
  - `ui/public/assets/city/w.png -> ui/public/assets/cities-knights/city-improvements/w.png`
- Updated Cities and Knights imports in `ui/src/assets.ts`.
- Verified no remaining references to old Cities and Knights paths via ripgrep.
- Ran `npm run lint` in `ui` (passes with one existing warning in `ui/components/playerList.tsx`).
- Moved Base runtime assets:
  - `ui/public/assets/tile-tex -> ui/public/assets/base/board/textures`
  - `ui/public/assets/house -> ui/public/assets/base/pieces/house`
  - `ui/public/assets/city -> ui/public/assets/base/pieces/city`
  - `ui/public/assets/number-tokens -> ui/public/assets/base/tokens/number-tokens`
  - `ui/public/assets/ports -> ui/public/assets/base/tokens/ports`
  - `ui/public/assets/cards -> ui/public/assets/base/cards/decks`
- Updated base imports in `ui/src/assets.ts`.
- Created `ui/assets/mappings.json` with legacy-to-current path aliases.
- Verified no stale old asset-path references in runtime code via ripgrep.
- Ran `npm run lint` in `ui` (passes with one existing warning in `ui/components/playerList.tsx`).
- Ran `npm test` in `ui` (1 test passing).
- Cleanup Stage A: moved shared buttons and runtime dice assets:
  - `ui/public/assets/buttons -> ui/public/assets/shared/buttons`
  - `ui/public/assets/dice/dice-*.png -> ui/public/assets/shared/dice/dice-*.png`
  - `ui/public/assets/dice/event-*.png -> ui/public/assets/shared/dice/event-*.png`
- Updated shared button/dice imports in `ui/src/assets.ts`.
- Updated `ui/assets/mappings.json` with buttons/dice prefix aliases.
- Verified no stale old button/dice references in runtime code via ripgrep.
- Verified all referenced assets exist on disk.
- Ran `npm run lint` in `ui` (passes with one existing warning in `ui/components/playerList.tsx`).
- Ran `npm test` in `ui` (1 test passing).
- Cleanup Stage B: moved shared global UI files:
  - `ui/public/assets/robber.png -> ui/public/assets/shared/ui/robber.png`
  - `ui/public/assets/bank.png -> ui/public/assets/shared/ui/bank.png`
  - `ui/public/assets/settings.png -> ui/public/assets/shared/ui/settings.png`
  - `ui/public/assets/bot.png -> ui/public/assets/shared/ui/bot.png`
  - `ui/public/assets/spectate.png -> ui/public/assets/shared/ui/spectate.png`
  - `ui/public/assets/timing-rules.png -> ui/public/assets/shared/ui/timing-rules.png`
- Updated Stage B references in:
  - `ui/src/assets.ts`
  - `ui/components/playerList.tsx`
  - `ui/components/game.tsx`
- Updated `ui/assets/mappings.json` with file aliases for moved Stage B assets.
- Verified no stale old Stage B references in runtime code via ripgrep.
- Verified all referenced assets exist on disk.
- Ran `npm run lint` in `ui` (passes with one existing warning in `ui/components/playerList.tsx`).
- Ran `npm test` in `ui` (1 test passing).
- Cleanup Stage C: extracted source/edit and legacy helper assets from `public` to `ui/assets/source`:
  - moved all `*.pdn` under `ui/public/assets/**` to `ui/assets/source/**`
  - moved all `*.svg` under `ui/public/assets/**` to `ui/assets/source/**`
  - moved legacy helper files:
    - `ui/public/assets/base/tokens/ports/original.png`
    - `ui/public/assets/base/tokens/ports/port.png`
    - `ui/public/assets/cities-knights/pieces/knight/original.png`
    - `ui/public/assets/cities-knights/pieces/knight/coin.png`
    - `ui/public/assets/cities-knights/pieces/merchant/generic.png`
- Verified there are no remaining `*.pdn` or `*.svg` files in `ui/public/assets`.
- Verified moved legacy helper files are no longer in `ui/public/assets`.
- Verified all referenced assets exist on disk.
- Ran `npm run lint` in `ui` (passes with one existing warning in `ui/components/playerList.tsx`).
- Ran `npm test` in `ui` (1 test passing).
- Added `ui/ASSET_STALE_REPORT.md` with conservative stale/legacy candidates (no deletions).
- Updated `ui/ASSET_SPEC.md` with canonical runtime/source layout and mode placement notes.
- Moved 10 candidate stale runtime files to `ui/assets/source/legacy-runtime-candidates`.
- Re-ran validation:
  - `npm run lint` (same existing warning in `ui/components/playerList.tsx`)
  - `npm test` (pass)
  - `npm run build` (pass)
- Re-ran asset integrity check: all referenced assets exist; remaining unreferenced public assets are dynamic avatars.
- Added `ui/ASSET_MIGRATION_SUMMARY.md` for commit-readiness tracking.
- Next move: manual smoke check and commit prep.
