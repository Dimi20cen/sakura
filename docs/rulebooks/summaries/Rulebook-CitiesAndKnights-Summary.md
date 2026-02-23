# CATAN Cities & Knights Rulebook Summary

Source files:
- PDF: `docs/rulebooks/Rulebook-Cities&Knights.pdf`
- Text extract: `docs/rulebooks/text/Rulebook-CitiesAndKnights.txt`

This expansion builds on all Base CATAN rules unless replaced below.

## Chapter 1: Objective

- First player to reach `13 VP` during their own turn wins immediately.

## Chapter 2: Turn Structure Changes

Cities & Knights uses 3 phases:

1. Roll Dice phase
2. Production phase
3. Action phase

### Roll Dice phase highlights

- Roll `3` dice: 2 production dice + 1 event die.
- Resolve event die before production dice effects.
- Alchemy progress card has pre-roll timing exception.

## Chapter 3: Barbarian System

### Barbarian movement

- Event die ship results move barbarian ship along track.
- When ship reaches end, barbarians attack.

### Attack resolution

- Barbarian strength = number of cities/metropolises on board.
- Defender strength = sum of strengths of all active knights.

Outcomes:

- If barbarians stronger:
  - Weakest contributor(s) suffer city pillage (city becomes settlement).
  - Metropolis cities cannot be pillaged.
- If defenders tie/beat barbarians:
  - Highest contributor gets `+1 VP` defender token.
  - If tie for highest, tied players draw progress cards instead (per rules).
- After attack:
  - Barbarian ship resets.
  - Knights are laid down (inactive).

## Chapter 4: Commodities and City Improvements

### Commodity layer

- Cities generate commodities in addition to resources.
- Commodity tracks:
  - Science
  - Trade
  - Politics

### Improvement tracks

- Spend commodities to advance each track level.
- Level unlocks grant permanent benefits per track.
- First to level 4/5 can claim and hold associated metropolis.
- Metropolis gives additional VP and defense implications.

## Chapter 5: New Buildables

### City walls

- Built on cities.
- Affect hand/discard tolerance and city survivability interactions per rules.

### Knights

- Three strengths:
  - Basic (1)
  - Strong (2)
  - Mighty (3)
- Lifecycle:
  - Recruit (placed inactive)
  - Activate (stand up)
  - Use one knight action, then knight becomes inactive
- Core knight actions:
  - Move
  - Displace weaker enemy knight
  - Chase robber (if adjacent and active)
- Knight positioning affects route blocking similarly to buildings.

## Chapter 6: Progress Cards

Three progress-card color families:

- Science
- Trade
- Politics

General handling:

- Draw rules linked to event die + city improvement level.
- Hand limit applies to progress cards.
- Some cards have strict timing windows.
- Victory Point progress cards are played face-up and not discarded.

## Chapter 7: Build/Trade Interaction Notes

- Base trading/building rules remain in force unless changed by C&K card/effect text.
- Commodity economy adds alternate upgrade paths and power spikes.
- Knights and city improvements create additional action competition each turn.

## Chapter 8: Combining with Seafarers

Official combination is supported with extra rules.
Key guidance from rulebook:

- C&K road-affecting rules generally apply to ships when combined.
- Setup and pirate/barbarian sequencing needs scenario-aware handling.
- Some Seafarers scenarios combine better than others.

## Chapter 9: Win Condition

- Reach `13+ VP` during your turn to win.

## Implementation Checklist Anchors

- 3-phase turn handling and event die processing
- Barbarian track progression and attack resolution
- Commodity production and city-improvement progression
- Metropolis claim/transfer logic
- Knight recruit/activate/action/deactivation rules
- Progress card draw/play limits and timing
- Combined-mode interoperability with Seafarers
