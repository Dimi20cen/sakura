# CATAN Base Rulebook Summary

Source files:
- PDF: `docs/rulebooks/Rulebook-Base.pdf`
- Text extract: `docs/rulebooks/text/Rulebook-Base.txt`

## Chapter 1: Objective

- First player to reach `10 VP` during their own turn wins immediately.
- Core VP sources:
  - Settlements: `1 VP` each
  - Cities: `2 VP` each
  - Longest Route tile: `+2 VP`
  - Largest Army tile: `+2 VP`
  - Victory Point development cards: revealed to win

## Chapter 2: Turn Structure

Each turn has two phases:

1. Production phase
2. Action phase

Then pass dice clockwise.

## Chapter 3: Production Phase Rules

### Play a development card (timing)

- You may play one development card on your turn.
- A development card bought this turn cannot be played this turn.
- Some cards can be played before dice roll.

### Roll dice and collect resources

- Roll 2 dice; matching number hexes produce.
- Settlement on producing hex: `1` matching resource.
- City on producing hex: `2` matching resources.
- If supply lacks enough cards for a produced resource type:
  - Usually no one gets that type this roll.
  - If only one player is affected, that player gets what remains.

### Resolve a 7

- No hexes produce.
- Players with more than 7 resource cards discard half (rounded down).
- Active player moves robber to a new hex and steals one random resource from one player with a building on that hex.
- Hex with robber does not produce while robber remains there.

## Chapter 4: Action Phase Rules

Players may perform actions repeatedly in any order while costs can be paid.

### Trading

- Trade with other players (only active player can trade; others cannot trade among themselves).
- General trade with supply: `4:1`.
- Port trade:
  - Generic port: `3:1`
  - Specific port: `2:1` for that resource
- Giveaway-equivalent trades are not allowed.

### Building

- Pay resource costs to build roads, settlements, cities, and development cards.
- Road placement:
  - Must connect to your road/building.
  - Cannot build through opponent building.
- Settlement placement:
  - Must connect to your road.
  - Must follow Distance Rule (at least 2 edges from any existing building).
- City placement:
  - Upgrades your own settlement in place.
- Development cards:
  - Draw from top of deck, keep hidden until used.
  - Do not count as resource cards for discard-on-7.
  - Not stealable by robber.
  - Not tradable.

## Chapter 5: Special Awards

### Longest Route

- First player with continuous route length `>= 5` receives tile (`+2 VP`).
- Route can be broken by opponent settlements.
- If no player qualifies, tile returns to supply.

### Largest Army

- First player to have played `3` Knight cards receives tile (`+2 VP`).
- Passed to player with strictly more played Knights.

## Chapter 6: Development Card Effects

- Knight: move robber, then steal as robber action.
- Road Building: place 2 roads at no resource cost.
- Invention (Year of Plenty): take any 2 resources from supply.
- Monopoly: choose one resource type, all players give that type.
- Victory Point: hidden until needed; can be revealed to trigger win.

## Chapter 7: Setup

### Fixed setup

- Preset board and numbers.

### Variable setup

- Build frame.
- Randomize hex placement.
- Place number discs in spiral order around board, skipping desert.
- Place robber on desert.
- Prepare supply and bonus tiles.
- Determine first player by highest roll.
- Initial placement:
  - Round 1 clockwise: settlement + adjacent road.
  - Round 2 reverse order: second settlement + adjacent road.
- Starting resources:
  - Gain resources adjacent to second settlement.

## Chapter 8: Win Condition

- If you reach `10+ VP` at any point during your turn, game ends immediately and you win.

## Implementation Checklist Anchors

Use this section to map base-rule changes into repo updates:

- Turn flow and action gating
- Discard-on-7 behavior and robber move
- Trade legality and port ratio handling
- Build placement constraints (roads/settlements/cities)
- Development card timing + effects
- Longest Route / Largest Army award logic
- Variable setup and initial settlement/resource flow
