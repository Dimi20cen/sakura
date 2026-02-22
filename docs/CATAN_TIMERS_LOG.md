# Catan Timers Log

Source file in repo:
- `docs/data/catan_timers.json`

Original local import source:
- `/home/dim/Downloads/catan/catan_timers.json`

Imported on:
- February 22, 2026

## Canonical Timer Tiers

| Tier | Turn | Dice | Place Robber | Select Who To Rob | Select Cards To Discard | Settlement Placement | Road Placement |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Very Fast | 30s | 10s | 15s | 10s | 20s | 60s | 15s |
| Fast | 60s | 10s | 20s | 20s | 20s | 120s | 30s |
| Normal | 120s | 20s | 40s | 40s | 40s | 180s | 45s |
| Slow | 240s | 60s | 80s | 80s | 80s | 360s | 90s |
| Very Slow | 200m | 50m | 50m | 50m | 50m | 300m | 75m |

## In-Game Mapping Notes

- `Speed = "30s"` maps to **Very Fast**.
- `Speed = "60s"` maps to **Fast**.
- `Speed = "120s"` maps to **Normal**.
- `Speed = "240s"` (and legacy `"slow"`) maps to **Slow**.
- `Speed = "200m"` maps to **Very Slow**.
- `Speed = "15s"` is a custom extra-fast turn option:
  - `Turn = 15s`
  - all other timers follow **Very Fast** values.

## Action Bonus / Special Build

`SpecialBuild` uses the action-bonus tier timing:
- Very Fast: `5s`
- Fast: `10s`
- Normal: `20s`
- Slow: `60s`
- Very Slow: `50m`

Runtime behavior:

- Action bonus timers are additive in gameplay. When a matching action succeeds,
  the configured bonus seconds are added to the current player's remaining time.
- The implementation maps to the source categories in `docs/data/catan_timers.json`:
  - `Action Bonuses`:
    - `PlaceRoad`
    - `PlaceSettlement`
    - `PlaceCity`
    - `NonTurnStateBoughtDevelopmentCard`
    - `NonTurnStateAcceptingTrade`
  - `Dev Card Bonuses`:
    - `NonTurnStatePlaceRobber`
    - `Place2MoreRoadBuilding`
    - `Place1MoreRoadBuilding`
    - `Select2ResourcesForYearOfPlenty`
    - `Select1ResourceForMonopoly`

## Timer Sync Protocol

Timer rendering is based on server-authoritative phase metadata:

- `tp` (`TimerPhaseId`) marks a timer phase/version.
- `te` (`TimerEndsAtMs`) is the server-provided end timestamp for the active phase.
- `ts` (`ServerNowMs`) is the server timestamp used to compensate client clock skew.

Rules used by the client HUD:

- On new `tp`, adopt incoming `te`.
- On same `tp`, only tighten to a lower `te`.
- Estimate server-now with `estimatedServerNow = now + (ts - nowAtReceipt)`.
- Recalculate server offset only when `ts` changes.
- Render `max(0, ceil((te - estimatedServerNow) / 1000))`.
- If `te == 0`, treat the timer as paused and display the server `TimeLeft` snapshot without local countdown.
- `te` may still be non-zero during `TickerPause` when the current player is in a pending timed action; this keeps countdown visible for those action windows.
- If timer metadata is absent (`tp/te/ts` all zero), run compatibility fallback countdown from `TimeLeft`.

This avoids countdown restarts caused by stale or out-of-order state snapshots.

Implementation notes:

- Timer computation lives in `ui/src/timer/turnTimer.ts`.
- Runtime timer ownership/snapshot sync lives in `ui/src/store/turnTimerRuntime.ts`.
- HUD rendering lives in `ui/src/buttons.ts`.
- Unit coverage for mode selection/countdown behavior is in `ui/src/timer/turnTimer.test.ts`.
