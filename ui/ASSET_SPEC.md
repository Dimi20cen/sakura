# Asset Spec

This file guides agents when replacing or adding game assets.

## Canonical Layout

- Runtime assets live under `ui/public/assets/...`.
- Source/edit files live under `ui/assets/source/...` (not in `public`).
- Mode folders:
  - `ui/public/assets/base/...`
  - `ui/public/assets/seafarers/...`
  - `ui/public/assets/cities-knights/...`
  - `ui/public/assets/shared/...`

## Path and Mapping Rules

- Default target root is `ui/public/assets/...`.
- Process only paths explicitly provided by the user unless user asks otherwise.
- If the user gives folders, treat them as top-level only unless recursion is explicitly requested.
- Keep filenames lowercase with dashes/underscores only.
- Use descriptive, stable filenames.
- If `ui/assets/mappings.json` exists, use it as preferred mapping hints.
- Do not place new `.pdn`/`.svg` source files under `ui/public/assets`.

## Mode Notes

- Base mode runtime assets should be placed in `assets/base/...` unless they are truly cross-mode.
- Base piece naming convention:
  - roads: `assets/base/pieces/road/road-<color>.png` and `assets/base/pieces/road/road.png`
  - settlements: `assets/base/pieces/settlement/settlement-<color>.png`
  - cities: `assets/base/pieces/city/city-<color>.png`
- Seafarers-specific runtime assets should be placed in `assets/seafarers/...`.
- Cities and Knights specific runtime assets should be placed in `assets/cities-knights/...`.
- Cross-mode UI/audio/common assets should be placed in `assets/shared/...`.
- Cities and Knights UI controls/icons/event die faces should live under:
  - `assets/cities-knights/buttons/...`
  - `assets/cities-knights/icons/...`
  - `assets/cities-knights/dice/...`
- Card deck convention:
  - Base/shared deck IDs remain in `assets/base/cards/decks/*`.
  - Cities and Knights-only deck IDs must live in `assets/cities-knights/cards/decks/*`.
  - Use descriptive filenames aligned to rulebook terms (for example `progress-politics-bishop.jpg`, not numeric IDs).
  - If moving IDs between these folders, update `ui/src/assets.ts` imports and `ui/assets/mappings.json` aliases in the same change.

## Quality Targets (guidance)

- UI icons/buttons: target <= 250 KB each.
- Board/gameplay sprites: target <= 500 KB each.
- Any single output > 1 MB must be called out in report with a reason.
- Preserve expected gameplay dimensions/aspect ratio unless replacement intent says otherwise.

## Oversize Handling (required)

If an output exceeds target size limits, optimize before apply in this order:
1. Lossless compression.
2. Format conversion (`png -> webp` when alpha/quality allows).
3. Dimension downscale in small steps (`-10%` per pass) until within limit.
4. If still over limit, apply with explicit warning and reason.

## Completion Checklist

1. Show dry-run plan with exact output paths.
2. Apply replacements from that plan only.
3. Report using these exact headers:
   - `FILES_PROVIDED`
   - `FILES_CHANGED`
   - `UNRESOLVED`
   - `ASSUMPTIONS`
