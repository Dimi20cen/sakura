# Seafarers MVP

This document describes the currently implemented Seafarers scope.

## Scope

- New standalone game mode: `Seafarers` (`Mode = 3`)
- Built-in Seafarers scenarios currently available:
  - `Seafarers - Heading for New Shores`
  - `Seafarers - The Four Islands`
  - `Seafarers - The Fog Islands`
  - `Seafarers - Through the Desert`
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

- Roads are allowed on land/coastal edges.
- Roads are rejected on pure-sea edges.
- Ships and roads do not share the same edge (edge occupancy rule).

### Ship Movement

- Exactly one ship move per turn.
- During action phase (after dice roll).
- A ship built this turn cannot be moved this turn.
- Ship must be open-ended/movable.
- Destination must be a valid ship build edge.

### Pirate

- Seafarers uses two persistent tokens:
  - Robber on land hexes
  - Pirate on sea hexes
- On a `7` or Knight card, the acting player moves either token by choosing a valid land/sea tile.
- Pirate blocks ship usage on adjacent edges (build/move destination checks).
- Pirate steal targets players with ships on the pirate sea hex.

### Longest Trade Route

- Computed across both roads and ships.
- Transition road <-> ship is allowed only through the owner’s settlement/city.
- Enemy settlement/city on a vertex blocks route continuation through that vertex.

## Map Availability

- Built-in official map names now include:
  - `Base`
  - `Seafarers - Heading for New Shores`
  - `Seafarers - The Four Islands`
  - `Seafarers - The Fog Islands`
  - `Seafarers - Through the Desert`
- Server resolves maps from DB first, then built-ins as fallback.

### Important lobby note

- If `Complexity = Seafarers` but `Map Name = Base`, ships are not buildable because the base map has no sea hexes.
- To use ships, choose a Seafarers map.

## Validation

### Automated smoke test

- File: `game/seafarers_smoke_test.go`
- Key scenario tests:
  - `TestSeafarersSmokeBuildShipAndMoveShip`
  - `TestSeafarersPirateStealsFromShip`
  - `TestSeafarersHasSeparateRobberAndPirateTokens`
  - `TestSeafarersScriptedMultiplayerSmoke`
  - `TestSeafarersFogIslandsInitializeAndReveal`
  - `TestSeafarersThroughDesertSettlementRegionBonus`

### Full test run

- `go test ./...`

### Frontend checks

- `cd ui && npm run lint`
- `cd ui && npm run build`
