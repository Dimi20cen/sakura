# Asset Smoke Checklist

Date: 2026-02-23
Owner:
Build/Branch:

Use this checklist for one manual pass before commit. Mark each item:
- `[x]` pass
- `[ ]` not run
- `[!]` fail (add note)

## Preflight

- [ ] Start UI locally (`cd ui && npm run dev`)
- [ ] Open app and confirm no missing-asset console/network errors at load
- [ ] Confirm key screens render: lobby, map/game screen, profile chooser

## Base Mode

### Board and Core Pieces

- [ ] Terrain/resource tiles render with expected textures
- [ ] Number tokens render correctly on tiles
- [ ] Ports render correctly
- [ ] Roads/settlements/cities render for all player colors
- [ ] Robber renders and can be moved via normal gameplay

### Cards and UI

- [ ] Resource cards render in hand and bank interactions
- [ ] Development cards render/use flow works
- [ ] Core action buttons render and respond (`road`, `settlement`, `city`, `dcard`, `endturn`)
- [ ] Button background color follows current player color

## Seafarers Mode

### Sea and Ship Flows

- [ ] Sea texture/fog/island/beach overlays render correctly
- [ ] Ship token renders on placement
- [ ] Ship build action works (`ship` button)
- [ ] Ship move action works (`move_ship` button)
- [ ] Pirate renders and behaves on sea tiles

### Mixed Route Behavior

- [ ] Longest route/trade route behavior looks correct when mixing roads and ships
- [ ] No missing textures while building near coast/sea boundaries

## Cities and Knights Mode

### Pieces and Track

- [ ] Knight levels (1/2/3) render correctly by player color
- [ ] Disabled knight overlay renders correctly
- [ ] Merchant renders correctly
- [ ] Barbarian track and ship render correctly

### City Improvements and Dice

- [ ] Metropolis markers (`m-6`, `m-7`, `m-8`) render when applicable
- [ ] Wall icon/asset renders correctly
- [ ] Cities and Knights action buttons render and respond (`knight_*`, `improve_*`, `w`)
- [ ] Event dice textures render correctly

## Shared Assets

- [ ] Profile icons render in header/profile chooser
- [ ] Avatar rotation/selection works (dynamic avatar paths)
- [ ] Shared sounds play (`ring`, `trade`, `dice`, `chat`, `playcard`)
- [ ] Shared UI assets render (`settings`, `spectate`, `bot`, `timing-rules`)

## Final Gate

- [ ] No broken images observed during full pass
- [ ] No 404s under `/assets/...` in browser network tab
- [ ] Record any failures in notes below

## Notes

- [ ] N/A

## Result

- [ ] PASS: Ready for commit from asset perspective
- [ ] FAIL: Needs fixes before commit
