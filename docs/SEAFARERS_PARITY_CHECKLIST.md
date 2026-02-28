# Seafarers Parity Checklist

This document tracks parity between the implemented Seafarers mode and the official Seafarers rulebook content.

## Scope

- In scope: Base game compatibility + Seafarers expansion parity.
- Out of scope: Cities and Knights (tracked separately).

## Current Coverage Snapshot

### Core Seafarers mechanics

| Area | Status | Notes |
|---|---|---|
| Ships (build/move) | `Implemented` | Includes open-end checks and one move per turn. |
| Robber + Pirate dual-token flow | `Implemented` | Both tokens persist on the map in Seafarers; on `7`/Knight the player moves either token by tile choice. |
| Pirate on sea | `Implemented` | Pirate blocks adjacent edges and steals from ships on sea hex. |
| Longest Route (roads + ships) | `Implemented` | Includes road/ship transition via own building and tie-safe holder logic. |
| Road Building card in Seafarers | `Implemented` | Supports `2 roads`, `2 ships`, or `1+1`. |
| Coastal road handling | `Implemented` | Coastal edges allow roads; pure sea edges reject roads. |
| Fog reveal from road/ship placement | `Implemented` | Reveal + discovery reward wired for both roads and ships. |
| Gold choice handling | `Implemented` | Choice flow added for discovery and initial settlement gold cases. |

### Official scenario parity

| Scenario | Status | What exists now | Gaps |
|---|---|---|---|
| Heading for New Shores (1) | `Implemented (First Pass)` | Built-in map + 14 VP target + main-island init restriction + per-player small-island bonus scoring are implemented. | Run full rulebook acceptance/sign-off and verify official map/layout parity. |
| The Four Islands (2) | `Implemented (First Pass)` | Built-in map + 13 VP target + per-player home-island tracking + unexplored-island bonus scoring are implemented. | Run full rulebook acceptance/sign-off and verify official map/layout parity. |
| The Fog Islands (3) | `Partial` | Built-in map + scenario metadata + stack-based fog discovery are implemented. | Official board/layout parity is still first-pass, and broader scenario acceptance coverage is still needed. |
| Through the Desert (4) | `Implemented (First Pass)` | Built-in map + metadata + 14 VP target + unexplored-region settlement bonus scoring + main-island init placement restriction are implemented. | Run full rulebook acceptance/sign-off and tune map details if needed. |
| The Forgotten Tribe (5) | `Missing` | No dedicated scenario support. | Implement scenario mechanics and map definitions. |
| Cloth for Catan (6) | `Missing` | No dedicated scenario support. | Implement cloth-trade scenario rules and map. |
| The Pirate Islands (7) | `Missing` | No dedicated scenario support. | Implement pirate fortress/fleet mechanics and map. |
| The Wonders of Catan (8) | `Missing` | No dedicated scenario support. | Implement wonder race rules and map. |
| New World Variant | `Missing` | No scenario generator or variant controls. | Add configurable scenario builder + validation rules. |

## Implementation Plan (Recommended Order)

1. `Phase 1`: Scenario data model and map onboarding
- [x] Extend map/scenario definition with scenario metadata (custom win condition, setup constraints, optional mechanics).
- [ ] Add official built-in map definitions for scenarios 2-8.
- [ ] Add New World variant configuration schema.

2. `Phase 2`: Scenario runtime hooks
- [x] Add setup-time hooks (placement constraints, starting assets, marker placement).
- [x] Add turn/event hooks (production modifiers, pirate/robber variants, custom interactions).
- [x] Add scenario-specific victory evaluators.

3. `Phase 3`: Scenario-by-scenario delivery
- [x] Scenario 2: The Four Islands.
- [x] Scenario 3: The Fog Islands (official map + variable setup path).
- [x] Scenario 4: Through the Desert.
- [ ] Scenario 5: The Forgotten Tribe.
- [ ] Scenario 6: Cloth for Catan.
- [ ] Scenario 7: The Pirate Islands.
- [ ] Scenario 8: The Wonders of Catan.
- [ ] New World variant.

4. `Phase 4`: Acceptance and hardening
- [ ] Add scenario regression suite (fixed setup + variable setup where applicable).
- [ ] Add scripted 2p/3p/4p smoke flows per scenario.
- [ ] Run rulebook parity sign-off checklist per scenario.

## Rulebook Audit TODOs

### Scenario 1: Heading for New Shores

- [x] Change scenario victory target from `12` VP to `14` VP.
- [x] Restrict initial settlement + road/ship placement to the main island.
- [x] Award `+2 VP` for each player's first settlement on each small island.
- [x] Track island-level awards per player, not globally.
- [x] Add regression test proving a small-island settlement awards VP only once per player per island.
- [x] Add regression test proving initial placements outside the main island are rejected.

### Scenario 2: The Four Islands

- [x] Change scenario victory target from `12` VP to `13` VP.
- [x] Model per-player home islands based on initial settlement placement.
- [x] Allow initial settlements on one island or two different islands, per rulebook.
- [x] Award `+2 VP` for each player's first settlement on each unexplored island.
- [x] Add regression test proving home islands do not grant bonus VP.
- [x] Add regression test proving a newly reached unexplored island does grant bonus VP.
- [x] Add regression test proving one player's home-island choices do not affect another player's explored/unexplored state.

### Scenario 3: The Fog Islands

- [x] Replace pre-placed fog-tile reveal with rulebook discovery stacks:
- [x] Use facedown hex stack for newly discovered locations.
- [x] Use facedown number-disc stack for discovered land hexes only.
- [x] Do not award a resource or number disc when the discovered hex is sea.
- [x] Preserve starting-placement rule that settlements with roads/ships may be placed on one island or two different islands.
- [x] Add regression test proving a road or ship adjacent to an empty discovery space reveals exactly one new hex.
- [x] Add regression test proving land discoveries get a number disc and one matching resource.
- [x] Add regression test proving sea discoveries get neither a number disc nor a resource.

### Scenario 4: Through the Desert

- [ ] Verify first-pass map against official fixed and variable layouts.
- [x] Add regression test proving each unexplored region awards `+2 VP` only once per player.
- [x] Add regression test proving the green land strip counts as an unexplored region and not part of the main island.
- [x] Add acceptance test for the 14-VP scenario victory condition during the active player's turn.

### Scenarios 5-8 and New World

- [ ] Add official map definitions instead of Heading for New Shores placeholders.
- [ ] Implement scenario-specific setup objects, markers, and special systems.
- [ ] Add one parity test file per scenario before marking any scenario as implemented.

## Missing Test Inventory

- [x] `game/seafarers_heading_for_new_shores_test.go`
- [x] `game/seafarers_fog_islands_test.go`
- [x] Acceptance tests for scenario-specific victory thresholds.
- [ ] Tests that initial placement filters apply to both the settlement vertex and the paired road/ship edge.
- [ ] Tests that per-player island/region bonus state survives save/load or journal replay.
- [ ] Tests that scenario metadata in the map catalog matches the rulebook victory target.

## Definition of Done for “Fully Implemented Seafarers”

- All eight official Seafarers scenarios are available as first-class game options.
- New World variant is available and validated.
- Scenario-specific setup/mechanics/win conditions match rulebook behavior.
- Automated tests cover core mechanics and scenario-specific rules.
- Base game regression suite remains green.
