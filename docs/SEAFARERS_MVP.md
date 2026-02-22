# Seafarers MVP

This document describes the currently implemented Seafarers scope.

## Scope

- New standalone game mode: `Seafarers` (`Mode = 3`)
- One official built-in scenario:
  - `Seafarers - Heading for New Shores`
- Core mechanics:
  - Ships
  - Ship movement
  - Pirate (sea robber)
  - Longest trade route

## Rules Implemented

### Ships

- Buildable type: `BTShip`
- Cost: `1 wood + 1 wool`
- Placement:
  - Only on water edges (edge adjacent to at least one sea tile)
  - Must connect to:
    - own coastal settlement/city, or
    - own existing ship chain

### Roads

- In Seafarers, roads are restricted to land edges (non-water edges).
- Road placement on water edges is rejected.

### Ship Movement

- Exactly one ship move per turn.
- Only before dice roll (`DiceState == 0`).
- Ship must be open-ended/movable.
- Destination must be a valid ship build edge.

### Pirate

- Robber can be moved to sea tiles in Seafarers (acts as pirate).
- Pirate blocks ship usage on adjacent edges (build/move destination checks).
- Steal flow remains adjacency-based via selected robber/pirate tile placements.

### Longest Trade Route

- Computed across both roads and ships.
- Transition road <-> ship is allowed only through the owner’s settlement/city.
- Enemy settlement/city on a vertex blocks route continuation through that vertex.

## Map Availability

- Built-in official map names now include:
  - `Base`
  - `Seafarers - Heading for New Shores`
- Server resolves maps from DB first, then built-ins as fallback.

## Validation

### Automated smoke test

- File: `game/seafarers_smoke_test.go`
- Test: `TestSeafarersSmokeBuildShipAndMoveShip`
- Covers:
  - Seafarers init
  - Coastal settlement setup
  - Ship build success
  - Road-on-water rejection
  - Move ship pre/post dice constraints
  - One-move-per-turn enforcement

### Full test run

- `go test ./...`

### Frontend checks

- `cd ui && npm run lint`
- `cd ui && npm run build`
