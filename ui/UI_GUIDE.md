# UI (Next.js Frontend)

This folder contains the SAKURA frontend app.

## Prerequisites

- Node.js 18+
- npm
- `ui/.env.local` configured (see `../docs/ENVIRONMENT.md`)
- Backend + Mongo running for full-stack flows (see `../docs/QUICK_START.md`)

## Scripts

- `npm run assets:check`: validate canonical asset layout and the `public/assets` serving alias
- `npm run dev`: start Next.js dev server (`http://localhost:3000`)
- `npm run build`: production build
- `npm run start`: serve production build
- `npm run lint`: run ESLint
- `npm run test`: run frontend tests

## Local Workflow

1. From repo root, ensure backend + Mongo are running.
2. In this folder, run:

```bash
npm install
npm run dev
```

3. Open:
- `http://localhost:3000`
- `http://localhost:3000/lobby`
- `http://localhost:3000/choose-profile`
- `http://localhost:3000/design/swatches` (resource palette preview)

## Asset Notes

- Canonical runtime assets live under `ui/assets/runtime`.
- `ui/public/assets` is a symlink to `ui/assets/runtime` so existing `/assets/...` URLs continue to work in Next.js.
- `ui/assets/source` mirrors runtime paths when editable source art exists; source files are optional, runtime files are required for anything the app uses.
- Run `npm run assets:check` after asset moves to verify the runtime tree, serving symlink, and code imports still match this convention.
- Base structure pieces (roads, settlements, cities) are sourced from SVG files under `ui/assets/source/base/pieces/*`.
- The runtime resolves those SVGs via URL-backed asset descriptors in `ui/src/assets.ts`, so structure art can stay vector without maintaining rasterized PNG copies.
- Ship pieces live under `ui/assets/source/seafarers/pieces/ship` and `ui/assets/runtime/seafarers/pieces/ship`.
- Board tile textures for `desert`, `wood`, `brick`, `wool`, `wheat`, `ore`, `gold`, `sea`, and `fog` live under `ui/assets/source/base/board/textures/` and `ui/assets/runtime/base/board/textures/`, and the app imports the runtime copies.
- Cities and Knights editable source currently lives under `ui/assets/source/cities-knights/city-improvements`, `ui/assets/source/cities-knights/pieces/knight`, and `ui/assets/source/cities-knights/pieces/merchant`.
- Base number tokens live only under `ui/assets/runtime/base/tokens/number-tokens`.
- Active base resource and development deck art now lives under `ui/assets/runtime/base/cards/decks` as SVG files for `wood`, `brick`, `wool`, `wheat`, `ore`, `knight`, `victory-point-card`, `road-building`, `year-of-plenty`, `monopoly`, and `development-card-back`.
- Active Cities and Knights commodity deck art now lives under `ui/assets/runtime/cities-knights/cards/decks` as SVG files for `commodity-paper`, `commodity-cloth`, and `commodity-coin`.
- Shared HUD icons live under `ui/assets/runtime/shared/icons`; `road.svg` and `knight.svg` are the normal longest-road and largest-army icons, while `road-highlight.svg` and `knight-highlight.svg` are their highlighted variants used by the player panel.
- Ports live under `ui/assets/source/base/ports` and `ui/assets/runtime/base/ports`; the active base port art now uses SVG sign files mapped by `ui/src/assets.ts` as `1=wood`, `2=brick`, `3=wool`, `4=wheat`, `5=ore`, and `6=any`, plus `pier.svg` as the dock connector rendered behind each sign.
- Seafarers runtime textures are currently limited to the files still referenced by the app, such as `beach.png`, `island-l.png`, and `island-r.png`, while the sea board image now lives under `ui/assets/runtime/base/board/sea.jpg`.
- `ui/src/assets.ts` declares tile render modes and a reference illustrated tile size so imported tile art can be normalized by asset dimensions, while `ui/src/board.ts` applies the final snug spacing and scale adjustments.

## API Routes in This App

API routes live under `ui/pages/api/*` and include:
- `api/servers`
- `api/games/*`
- `api/maps/*`
- `api/auth/[...nextauth]`
- `api/users/*`

## Related Docs

- Root setup: `../docs/QUICK_START.md`
- Ubuntu setup: `../docs/LOCAL_SETUP_UBUNTU.md`
- Env vars: `../docs/ENVIRONMENT.md`
- Troubleshooting: `../docs/TROUBLESHOOTING.md`
- Asset layout/source art: `./assets/source`
- Canonical runtime assets: `./assets/runtime`
- Runtime serving alias: `./public/assets`
- Runtime asset registry: `./src/assets.ts`
