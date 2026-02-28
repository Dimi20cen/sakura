# UI (Next.js Frontend)

This folder contains the SAKURA frontend app.

## Prerequisites

- Node.js 18+
- npm
- `ui/.env.local` configured (see `../docs/ENVIRONMENT.md`)
- Backend + Mongo running for full-stack flows (see `../docs/QUICK_START.md`)

## Scripts

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

- Base structure pieces (roads, settlements, cities) are sourced from SVG files under `ui/assets/source/base/pieces/*`.
- The runtime resolves those SVGs via URL-backed asset descriptors in `ui/src/assets.ts`, so structure art can stay vector without maintaining rasterized PNG copies.
- Ship pieces are sourced from per-color SVG files under `ui/assets/source/base/pieces/ship`, including generated `cyan` and `plum` variants to match the repo's player color set.
- Board tile textures for `desert`, `wood`, `brick`, `wool`, `wheat`, `ore`, `gold`, `sea`, and `fog` are sourced from vendored Colonist SVGs under `ui/assets/source/base/board/textures/`.
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
- Asset layout/spec: `./ASSET_SPEC.md`
