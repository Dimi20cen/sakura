# Asset Mode List and Placement Audit

Date: 2026-02-23

## Guide Sources Reviewed

- `README.md` (game modes + Seafarers MVP summary)
- `docs/SEAFARERS_MVP.md` (Seafarers mechanics + scenarios)
- `docs/SEAFARERS_PARITY_CHECKLIST.md` (Seafarers parity scope)
- `docs/ARCHITECTURE.md` (mode IDs)
- `ui/src/buttons.ts` (mode-gated UI actions for Base/Seafarers/Cities and Knights)
- `ui/src/assets.ts` (runtime asset imports used by board/UI)

Note: there is no dedicated Cities and Knights asset guide file in `docs/`; the asset list below is derived from runtime code paths.

## Asset List by Game Mode

### Base (Mode 1)

- Board textures/roads/resources:
  - `assets/base/board/textures/*`
- Settlements and cities:
  - `assets/base/pieces/city/city-*.png`
  - `assets/base/pieces/house/house-*.png`
- Number tokens and ports:
  - `assets/base/tokens/number-tokens/*.png`
  - `assets/base/tokens/ports/{1..6}.png`
- Card decks used by the base flow:
  - `assets/base/cards/decks/*` (resource, development, and progress IDs currently loaded from this folder)
- Base/core shared gameplay pieces also used in board runtime:
  - `assets/robber.png`
  - `assets/bank.png`

### Seafarers (Mode 3)

- Sea board/terrain overlays:
  - `assets/seafarers/board/sea.jpg`
  - `assets/seafarers/textures/sea.webp`
  - `assets/seafarers/textures/fog.jpg`
  - `assets/seafarers/textures/beach.png`
  - `assets/seafarers/textures/island-l.png`
  - `assets/seafarers/textures/island-r.png`
- Seafarers pieces:
  - `assets/seafarers/pieces/ships/ship-token.png`
  - `assets/seafarers/pieces/pirate.png`
- Seafarers mode actions (UI buttons):
  - `assets/buttons/ship.png`
  - `assets/buttons/move_ship.png`

### Cities and Knights (Mode 2)

- Knight piece set:
  - `assets/cities-knights/pieces/knight/1-*.png`
  - `assets/cities-knights/pieces/knight/2-*.png`
  - `assets/cities-knights/pieces/knight/3-*.png`
  - `assets/cities-knights/pieces/knight/disabled.png`
- Merchant:
  - `assets/cities-knights/pieces/merchant/*.png`
- Barbarian track/ship:
  - `assets/cities-knights/board/barbarian/track.png`
  - `assets/cities-knights/board/barbarian/ship.png`
- City improvements / metropolis / wall:
  - `assets/cities-knights/city-improvements/m-6.png`
  - `assets/cities-knights/city-improvements/m-7.png`
  - `assets/cities-knights/city-improvements/m-8.png`
  - `assets/cities-knights/city-improvements/w.png`
- Cities and Knights mode actions (UI buttons):
  - `assets/buttons/knight.png`
  - `assets/buttons/knight_build.png`
  - `assets/buttons/knight_activate.png`
  - `assets/buttons/knight_robber.png`
  - `assets/buttons/knight_move.png`
  - `assets/buttons/improve.png`
  - `assets/buttons/improve_paper.jpg`
  - `assets/buttons/improve_cloth.jpg`
  - `assets/buttons/improve_coin.jpg`
  - `assets/buttons/w.png`
- Cities and Knights event dice also present and loaded:
  - `assets/dice/event-1.png`
  - `assets/dice/event-2.png`
  - `assets/dice/event-3.png`
  - `assets/dice/event-4.png`

## Directory Placement Verification

### Hard checks run

- Verified all code-referenced assets exist on disk:
  - `204` referenced paths checked
  - Result: `ALL_REFERENCED_ASSETS_EXIST`
- Current mode directory file counts:
  - `assets/base`: `126` files
  - `assets/seafarers`: `8` files
  - `assets/cities-knights`: `36` files
  - `assets/shared`: `45` files

### Status

- Base mode assets: `PASS` (runtime references point to `assets/base/...` and files exist)
- Seafarers mode assets: `PASS` (runtime references point to `assets/seafarers/...` and files exist)
- Cities and Knights mode assets: `PASS` (runtime references point to `assets/cities-knights/...` and files exist)

## Findings from second pass

- Top-level cross-mode assets still outside `assets/shared/...`:
  - `assets/buttons/*`, `assets/dice/*`, `assets/robber.png`, `assets/bank.png`, `assets/settings.png`, etc.
  - This is consistent with current code, but structurally these are shared assets.
- Source/edit artifacts are present under runtime `public` paths:
  - `.pdn` files in `assets/base/pieces/*`, `assets/cities-knights/pieces/knight/`, and `assets/dice/`
  - `.svg` dice sources in `assets/dice/`
- Some files are currently not directly referenced by static path lookup (for example `assets/buttons/bg/grey.jpg`, `assets/cities-knights/pieces/merchant/generic.png`), but may be intentional reserves.
- Avatar files under `assets/shared/avatars/*` are used via dynamic path construction in `ui/src/state.ts`, so they are valid even though they do not appear as static imports.
