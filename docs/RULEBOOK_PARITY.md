# Rulebook Parity Log

Tracks alignment between repository behavior and official rulebooks.

## Normative Rulebook Inputs

- Base: `docs/rulebooks/Rulebook-Base.pdf` (text: `docs/rulebooks/text/Rulebook-Base.txt`)
- Cities and Knights: `docs/rulebooks/Rulebook-Cities&Knights.pdf` (text: `docs/rulebooks/text/Rulebook-CitiesAndKnights.txt`)
- Seafarers: `docs/rulebooks/Rulebook_Seafarers.pdf` (text: `docs/rulebooks/text/Rulebook-Seafarers.txt`)

## How To Use This File

- Add entries when gameplay behavior is implemented, changed, or intentionally left different from rulebooks.
- Keep entries concise and test-linked.
- If a difference is temporary, include a follow-up action.

Entry format:

- `Area`: rule/system name
- `Mode`: Base / Cities and Knights / Seafarers
- `Rulebook`: short reference (chapter/page/section if available)
- `Repo status`: aligned / partial / intentional deviation / unknown
- `Notes`: short implementation note
- `Evidence`: code path and/or tests
- `Next action`: optional follow-up

## Current Snapshot (Initial)

### Seafarers

- Area: Ship movement timing
- Mode: Seafarers
- Rulebook: Seafarers ship movement timing section
- Repo status: aligned
- Notes: Ship movement is allowed once per turn and only before rolling dice.
- Evidence: `game/actions.go` (`MoveShip`, `MoveShipInteractive`), `game/seafarers_smoke_test.go`
- Next action: none

- Area: Scenario coverage (official scenarios)
- Mode: Seafarers
- Rulebook: Seafarers scenarios catalog
- Repo status: partial
- Notes: Scenarios 1-4 have built-in playable maps; scenarios 5-8 and New World are placeholders/metadata-only.
- Evidence: `maps/main.go`, `maps/seafarers_scenarios.go`, `docs/SEAFARERS_PARITY_CHECKLIST.md`
- Next action: continue parity delivery for missing scenarios.

- Area: Pirate blocking for setup ship placement
- Mode: Seafarers
- Rulebook: Seafarers pirate blocking on sea routes
- Repo status: aligned
- Notes: During initial road/ship placement, edges adjacent to the pirate are excluded from ship-eligible setup choices.
- Evidence: `game/init_phase.go` (`getInitEdgeChoices`), `game/init_phase_edge_choices_test.go` (`TestInitEdgeChoicesExcludeShipOnPirateBlockedEdge`)
- Next action: none

- Area: Heading for New Shores scenario parity
- Mode: Seafarers
- Rulebook: Seafarers scenario 1 (`Heading for New Shores`)
- Repo status: aligned
- Notes: Scenario uses a 14-VP target, restricts initial settlement + road/ship placement to the main island, and awards +2 VP per player for the first settlement on each small island.
- Evidence: `maps/main.go`, `game/scenario_heading_for_new_shores.go`, `game/seafarers_heading_for_new_shores_test.go`, `docs/rulebooks/text/Rulebook-Seafarers.txt`
- Next action: verify full official map/layout parity.

- Area: Four Islands scenario parity
- Mode: Seafarers
- Rulebook: Seafarers scenario 2 (`The Four Islands`)
- Repo status: aligned
- Notes: Scenario uses a 13-VP target and tracks each player's home islands from their initial settlements so only unexplored-island settlements award +2 VP.
- Evidence: `maps/seafarers_scenarios.go`, `game/scenario_four_islands.go`, `game/seafarers_four_islands_test.go`, `docs/rulebooks/text/Rulebook-Seafarers.txt`
- Next action: verify full official map/layout parity.

- Area: Fog Islands scenario parity
- Mode: Seafarers
- Rulebook: Seafarers scenario 3 (`The Fog Islands`)
- Repo status: partial
- Notes: Discovery now uses runtime tile and number stacks so land discoveries gain a number disc plus reward, while sea discoveries gain neither. Map/layout parity remains first-pass.
- Evidence: `maps/seafarers_scenarios.go`, `game/scenario_fog_islands.go`, `game/actions.go` (`RevealFogAdjacentToEdge`), `game/seafarers_fog_islands_test.go`, `game/seafarers_smoke_test.go`, `docs/rulebooks/text/Rulebook-Seafarers.txt`
- Next action: verify official map/layout parity and expand scenario acceptance coverage.

### Base

- Area: Full parity audit coverage
- Mode: Base
- Rulebook: Base rulebook
- Repo status: unknown
- Notes: No complete chapter-by-chapter parity log has been recorded yet.
- Evidence: N/A
- Next action: run structured Base parity audit and populate entries.

### Cities and Knights

- Area: Full parity audit coverage
- Mode: Cities and Knights
- Rulebook: Cities and Knights rulebook
- Repo status: unknown
- Notes: No complete chapter-by-chapter parity log has been recorded yet.
- Evidence: N/A
- Next action: run structured Cities and Knights parity audit and populate entries.
