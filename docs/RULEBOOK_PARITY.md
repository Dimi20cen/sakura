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
