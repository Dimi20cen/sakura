# Sakura Brand Guidelines

This document is the visual source of truth for the current art direction.

## Creative Direction v1

- Style: Hanafuda-lite (not fully ornate/traditional).
- Tone: elegant, seasonal, handcrafted, symbolic.
- Product intent: keep tactical readability first while adding distinctive Hanafuda flavor.
- Visual balance: expressive board textures + restrained high-clarity gameplay UI.

## Lightweight Art Lock v1

This lock is intentionally small. It exists to avoid design drift and rework while preserving creative freedom.

### Lock Scope

The following areas are locked and must stay consistent unless explicitly revised in this document:

1. Palette token usage and sakura accent rules.
2. Resource motif mapping and primary icon silhouettes.
3. Player identity rules (orange/white/red/blue with non-color cues).
4. Interaction/state visuals (hover, focus, selected, disabled, success, error).
5. Reference screens listed below.

### Catan Readability Cap (Non-Negotiable)

Because gameplay readability is critical in Catan-like board states, decorative detail must be capped:

- Board tiles: medium detail maximum.
- Resource cards and number tokens: low-to-medium detail.
- Player pieces/roads/ships: low detail, high silhouette clarity.
- HUD/buttons/forms: low detail only.

Hard rule:
- If visual detail slows recognition of ownership, resource, token value, or action state, remove or simplify it.

### Resource Motif Dictionary (Locked)

- `wood`: pine/needle motif + wood-grain secondary texture.
- `brick`: geometric stamp motif + block rhythm.
- `wheat`: sheaf/reed motif with clear stalk silhouette.
- `wool`: soft curl/cloud motif with simple spiral icon.
- `ore`: faceted mineral motif with angular highlights.
- `gold` tile: ore-family silhouette with gilded frame accents.
- `desert` tile: dry grain + sparse brush marks.
- `sea` tile: layered wave motif with calm center for overlays.

### Player Identity Rules (Locked)

- `orange`, `white`, `red`, `blue` remain the canonical local profile colors.
- Ownership recognition cannot rely on color alone.
- White pieces must include darker outline and/or trim cues to remain readable against light surfaces.

### Reference Screens (Acceptance Targets)

These are the visual baselines for future UI/theming changes:

- Lobby list: `/` (game list view)
- Profile select: `/choose-profile`
- In-game lobby/settings: `/:gameId` before game start
- Map editor: `/maps`

### Readability Budget (Non-Negotiable)

- Resource type recognition at low zoom.
- Number token legibility on all tile variants.
- Player ownership clarity (orange/white/red/blue) using color plus shape/outline cues.
- Action state clarity (active, disabled, selectable) without color-only signaling.

### Core Palette Tokens

- `--player-orange: #F07A1F`
- `--player-white: #F4F0E6`
- `--player-red: #C4372F`
- `--player-blue: #2F5FAF`
- `--ink-dark: #1F1A17`
- `--paper-cream: #F6F1E8`
- `--gold-accent: #C9A34A`
- `--wood-brown: #7A5230`
- `--sea-deep: #2E5E73`
- `--sea-light: #7FA7B8`

### Sakura Accent Layer

- `--sakura-pink: #E8A7B5`
- `--sakura-deep: #B85C74`
- `--sakura-mist: #F6DDE4`

Usage rules:
- Treat sakura as brand accent, not primary gameplay meaning.
- Use for hover/focus accents, decorative badges, and soft thematic surfaces.
- Never use sakura colors to encode ownership, resource type, or danger.
- Pair sakura accents with `--ink-dark` text to preserve contrast.

## Canonical Resource Model

These assignments are fixed and should drive all icon, card, and tile art:

- `wood`: resource card + board tile
- `brick`: resource card + board tile
- `wheat`: resource card + board tile
- `wool`: resource card + board tile
- `ore`: resource card + board tile
- `gold`: board tile only
- `desert`: board tile only
- `sea`: board tile only

### Resource Color Lock v1 (Distinctness First)

These colors are locked for fast recognition and must remain visually distinct from each other:

- `wood`
  - Primary: `#3E7A3B`
  - Secondary: `#2F5F2D`
  - Label/Text: `#F6F1E8`
- `brick`
  - Primary: `#B54A36`
  - Secondary: `#8F3728`
  - Label/Text: `#F6F1E8`
- `wheat`
  - Primary: `#D8B847`
  - Secondary: `#B8962F`
  - Label/Text: `#1F1A17`
- `wool`
  - Primary: `#8FAF7A`
  - Secondary: `#6E8C5C`
  - Label/Text: `#1F1A17`
- `ore`
  - Primary: `#6B6F7A`
  - Secondary: `#515661`
  - Label/Text: `#F6F1E8`
- `gold` (tile only)
  - Primary: `#D4A72C`
  - Secondary: `#A8821F`
  - Label/Text: `#1F1A17`
- `desert` (tile only)
  - Primary: `#C9A676`
  - Secondary: `#A88659`
  - Label/Text: `#1F1A17`
- `sea` (tile only)
  - Primary: `#3C6E8F`
  - Secondary: `#2C536D`
  - Label/Text: `#F6F1E8`

Distinctness rules:
- `wood` and `wool` must stay separated by value and saturation, not just hue.
- `wheat` and `gold` must stay separated by warmth and contrast level.
- `ore` must remain the only neutral/cool gray family.
- Number tokens should keep a consistent calm token base so tile color does not reduce number readability.

Design guidance:
- Keep resource symbols consistent between tile and card versions.
- Use seasonal/flower motifs as secondary framing, not as the primary resource identifier.
- Preserve gameplay legibility first: players must identify resource type at a glance at low zoom.

## Default Local Profile Identity

Fixed default profile color mapping:

- `KopsTiKlapsa` -> `orange` (`#ff7a00`)
- `staxtoPUTA` -> `white` (`#ffffff`)
- `Giorgaros` -> `red` (`#ff0000`)
- `Jethro7194` -> `blue` (`#0000ff`)

Implementation note:
- Current runtime uses temporary asset aliases for `orange` and `white` until dedicated art is produced.
- New Hanafuda asset packs should replace those aliases with first-class color-specific assets.

## Typography

- Display headings: `Cormorant Garamond` (fallback: `Noto Serif JP`).
- UI/body text: `Noto Sans` (fallback: `Source Sans 3`).
- Decorative type should not be used for dense gameplay labels.

## Hanafuda Art Rules

- Use bold silhouettes for roads, settlements, cities, and interactive icons.
- Apply paper texture and botanical framing as secondary treatment.
- Prefer warm off-black linework over pure black where possible.
- Keep number tokens and counters visually calm and high contrast.
- Avoid busy texture behind key gameplay text.

## UI Principles

- Board elements may be ornate; HUD and action buttons should stay restrained and clear.
- Typography should feel traditional but readable on small displays.
- Animation should suggest physical card movement and brush-like transitions, never distract from turn flow.

## Rollout Priority

1. Global color/type tokens wired into UI.
2. Player piece set (orange/white/red/blue) with shape cues for white.
3. Resource tile + resource card pairing with shared icon silhouettes.
4. Number tokens, ports, and readability pass on board overlays.
5. HUD/button/lobby thematic skin pass using sakura accent rules.
