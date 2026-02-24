# Game Rules Spec

This is the canonical gameplay behavior spec for this repository.

If this file conflicts with implementation, code is authoritative short-term, and this file must be updated in the same change.

## Scope and Intent

- Defines expected gameplay behavior for all supported modes.
- Documents what is implemented vs partial/placeholder.
- Gives agents a single source of truth for gameplay-related documentation updates.

## Normative Rulebook Sources

The project should align with these rulebooks unless an intentional deviation is documented:

- Base: `docs/rulebooks/Rulebook-Base.pdf` (text: `docs/rulebooks/text/Rulebook-Base.txt`)
- Cities and Knights: `docs/rulebooks/Rulebook-Cities&Knights.pdf` (text: `docs/rulebooks/text/Rulebook-CitiesAndKnights.txt`)
- Seafarers: `docs/rulebooks/Rulebook_Seafarers.pdf` (text: `docs/rulebooks/text/Rulebook-Seafarers.txt`)

Policy:

- Rulebooks are the normative behavior source.
- If implementation intentionally differs, document it in `docs/RULEBOOK_PARITY.md` with rationale.
- Keep this file (`GAME_RULES_SPEC.md`) synchronized to implemented behavior while parity work is in progress.

## Canonical Game Modes

- `Mode = 1`: `Base` ("Basic" in UI)
- `Mode = 2`: `Cities and Knights`
- `Mode = 3`: `Seafarers`

Source: `entities/game_mode.go`, `ui/src/lobby.ts`.

## Cross-Mode Core Rules

- Game settings include: mode, map name, victory points target, max players, speed, special build, creative mode, advanced options.
- Map resolution order:
  1. DB map by name
  2. built-in map by name
  3. fallback to `Base`
- Core victory bonuses:
  - `Longest Road`: +2 VP (roads; Seafarers extends to roads+ships as trade route behavior)
  - `Largest Army`: +2 VP (tracked in Base via played knights)
- Timer is server-authoritative and snapshot-based (`StateSeq`, `TimerPhaseId`, `TimerEndsAtMs`, `ServerNowMs`).

Primary references: `game/state.go`, `maps/main.go`, `docs/ARCHITECTURE.md`.

## Base Mode (`Mode = 1`)

Status: Implemented.

- Standard base-economy/resource gameplay.
- Largest Army in this mode is tied to used Knight development cards.
- UI and lobby label this mode as `Basic`.

Primary references: `entities/game_mode.go`, `game/state.go`, `ui/src/lobby.ts`.

## Cities and Knights (`Mode = 2`)

Status: Implemented in current runtime.

Expected behavior in this repo:

- Adds city improvements (`paper`, `cloth`, `coin`) and progress-card flow.
- Adds knight systems (build/activate/move/robber interactions).
- Adds barbarian/event-die systems and merchant/wall related gameplay elements.
- Development/progress card handling differs from Base (separate progress stacks and counts).

Primary references:
- `game/state.go`
- `game/dice.go`
- `game/barbarian.go`
- `ui/src/buttons.ts`
- `ui/src/resourceBank.ts`

## Seafarers (`Mode = 3`)

Status: Core mechanics implemented; scenario parity is mixed (see below).

### Implemented core mechanics

- Ships:
  - buildable type `BTShip`
  - cost `1 wood + 1 wool`
  - build only on water edges
  - must connect to own coastal settlement/city or own ship chain
- Roads:
  - allowed on land/coastal edges
  - rejected on pure sea edges
  - roads and ships cannot share one edge
- Ship movement:
  - exactly one move per turn
  - only before rolling dice
  - ships built that turn cannot be moved
- Robber + Pirate dual-token behavior:
  - robber remains for land
  - pirate applies on sea
  - on `7`/Knight, player chooses valid land/sea target
  - pirate blocks adjacent ship edge usage and can steal from ship-adjacent players
  - during setup edge placement, pirate-blocked edges are not offered as ship options
- Longest trade route behavior:
  - computed across roads + ships
  - road/ship transition requires own settlement/city at transition vertex
  - enemy settlement/city blocks continuation through that vertex

Primary references:
- `game/actions.go`
- `game/state.go`
- `game/dice.go`
- `game/seafarers_smoke_test.go`
- `docs/SEAFARERS_MVP.md`

### Seafarers scenarios

Currently playable built-in scenarios:

- `Seafarers - Heading for New Shores` (12 VP target)
- `Seafarers - The Four Islands` (12 VP target, first-pass)
- `Seafarers - The Fog Islands` (12 VP target, first-pass)
- `Seafarers - Through the Desert` (14 VP target, first-pass)

Catalog-only placeholder scenarios (metadata wired; full rules not implemented):

- `Seafarers - The Forgotten Tribe`
- `Seafarers - Cloth for Catan`
- `Seafarers - The Pirate Islands`
- `Seafarers - The Wonders of Catan`
- `Seafarers - New World Variant`

Primary references:
- `maps/main.go`
- `maps/seafarers_scenarios.go`
- `docs/SEAFARERS_PARITY_CHECKLIST.md`

## Timer and Speed Expectations

- Canonical speed keys include: `15s`, `30s`, `60s`, `120s`, `200m` (plus legacy compatibility aliases).
- Timer display logic is based on server timestamps and phase ids, not client-local free-running only.

Primary references:
- `entities/game_mode.go`
- `docs/CATAN_TIMERS_LOG.md`
- `docs/ARCHITECTURE.md`

## Rule Change Workflow (Agents)

When gameplay behavior changes:

1. Check the relevant rulebook section and confirm intended behavior.
2. Update this file (`docs/GAME_RULES_SPEC.md`).
3. Update `docs/RULEBOOK_PARITY.md` when behavior is added, aligned, or intentionally deviates.
4. Update mode-specific docs as needed:
   - `docs/SEAFARERS_MVP.md`
   - `docs/SEAFARERS_PARITY_CHECKLIST.md`
   - `docs/ARCHITECTURE.md` (if protocol/runtime ownership changed)
5. Add/adjust tests that prove the changed behavior.
6. Mention `Docs Updated` in the final task summary.
