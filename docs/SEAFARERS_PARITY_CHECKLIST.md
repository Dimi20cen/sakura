# Seafarers Parity Checklist

This document tracks parity between the implemented Seafarers mode and the official Seafarers rulebook content.

## Scope

- In scope: Base game compatibility + Seafarers expansion parity.
- Out of scope: Wonders & Warriors (tracked separately).

## Current Coverage Snapshot

### Core Seafarers mechanics

| Area | Status | Notes |
|---|---|---|
| Ships (build/move) | `Implemented` | Includes open-end checks and one move per turn. |
| Pirate on sea | `Implemented` | Pirate blocks adjacent edges and steals from ships on sea hex. |
| Longest Route (roads + ships) | `Implemented` | Includes road/ship transition via own building and tie-safe holder logic. |
| Road Building card in Seafarers | `Implemented` | Supports `2 roads`, `2 ships`, or `1+1`. |
| Coastal road handling | `Implemented` | Coastal edges allow roads; pure sea edges reject roads. |
| Fog reveal from road/ship placement | `Implemented` | Reveal + discovery reward wired for both roads and ships. |
| Gold choice handling | `Implemented` | Choice flow added for discovery and initial settlement gold cases. |

### Official scenario parity

| Scenario | Status | What exists now | Gaps |
|---|---|---|---|
| Heading for New Shores (1) | `Partial` | Built-in map exists and core flow works. | Full scenario acceptance sweep still needed. |
| The Four Islands (2) | `Partial` | Built-in map and scenario metadata now exist as first-pass implementation. | Run full rulebook-accurate setup/rules acceptance and refine map parity. |
| The Fog Islands (3) | `Partial` | Engine supports fog + discovery behavior; test-only fog-style map exists. | Add official map/variable setup + scenario win-condition tests. |
| Through the Desert (4) | `Missing` | No dedicated scenario map/rules. | Add map + scenario-specific validations. |
| The Forgotten Tribe (5) | `Missing` | No dedicated scenario support. | Implement scenario mechanics and map definitions. |
| Cloth for Catan (6) | `Missing` | No dedicated scenario support. | Implement cloth-trade scenario rules and map. |
| The Pirate Islands (7) | `Missing` | No dedicated scenario support. | Implement pirate fortress/fleet mechanics and map. |
| The Wonders of Catan (8) | `Missing` | No dedicated scenario support. | Implement wonder race rules and map. |
| New World Variant | `Missing` | No scenario generator or variant controls. | Add configurable scenario builder + validation rules. |

## Implementation Plan (Recommended Order)

1. `Phase 1`: Scenario data model and map onboarding
- [ ] Extend map/scenario definition with scenario metadata (custom win condition, setup constraints, optional mechanics).
- [ ] Add official built-in map definitions for scenarios 2-8.
- [ ] Add New World variant configuration schema.

2. `Phase 2`: Scenario runtime hooks
- [ ] Add setup-time hooks (placement constraints, starting assets, marker placement).
- [ ] Add turn/event hooks (production modifiers, pirate/robber variants, custom interactions).
- [ ] Add scenario-specific victory evaluators.

3. `Phase 3`: Scenario-by-scenario delivery
- [ ] Scenario 2: The Four Islands.
- [ ] Scenario 3: The Fog Islands (official map + variable setup path).
- [ ] Scenario 4: Through the Desert.
- [ ] Scenario 5: The Forgotten Tribe.
- [ ] Scenario 6: Cloth for Catan.
- [ ] Scenario 7: The Pirate Islands.
- [ ] Scenario 8: The Wonders of Catan.
- [ ] New World variant.

4. `Phase 4`: Acceptance and hardening
- [ ] Add scenario regression suite (fixed setup + variable setup where applicable).
- [ ] Add scripted 2p/3p/4p smoke flows per scenario.
- [ ] Run rulebook parity sign-off checklist per scenario.

## Definition of Done for “Fully Implemented Seafarers”

- All eight official Seafarers scenarios are available as first-class game options.
- New World variant is available and validated.
- Scenario-specific setup/mechanics/win conditions match rulebook behavior.
- Automated tests cover core mechanics and scenario-specific rules.
- Base game regression suite remains green.
