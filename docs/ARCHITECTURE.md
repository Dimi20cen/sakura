# Architecture Overview

This document explains how Clash components communicate in local development.

## High-Level Components

- Backend (Go): game/session logic, JWT auth, websocket server
- Frontend (Next.js): UI, local API routes, auth/session integration
- Database (MongoDB): users, games, game states, maps, active servers

## Directory Map

- `cmd/server/main.go`: backend entrypoint
- `server/`: HTTP routes, websocket hub, JWT middleware
- `mango/`: MongoDB config and registry operations
- `game/`: game engine and rule logic
- `entities/`: domain models
- `ui/pages/`: Next.js pages + API routes
- `ui/hooks/`: auth + session orchestration hooks (`lobbySession`, `gameSession`)
- `ui/src/net/`: websocket transport lifecycle
- `ui/src/protocol/`: wire-message adaptation to domain events
- `ui/src/commands/`: outbound command builders
- `ui/src/store/`: Redux Toolkit slices + runtime handlers
- `ui/src/hudLayout.ts`: shared HUD positioning preset and right-rail/bottom-rail layout helpers
- `ui/src/`: Pixi/runtime rendering modules
- `ui/utils/mango.ts`: Mongo access from Next.js API routes

## Runtime Flow

## 1. Backend startup

1. `cmd/server/main.go` calls `server.RunServer()`
2. Server initializes Mongo-backed registry
3. Server registers its own URL (`SERVER_URL`) into `servers` collection
4. Heartbeat updates run every 10 seconds
5. HTTP server starts on `HOST:PORT`

Key routes in `server/server.go`:

- `GET /heartbeat`
- `POST /games`
- `GET|POST /anon`
- `GET /verify`
- `POST /register`
- `GET /socket` (websocket upgrade)

## 2. Frontend startup

1. Next.js starts on port `3000`
2. UI pages call Next.js API routes (`/api/*`) for server and game discovery
3. If no profile is selected, user is redirected to `/choose-profile`
4. Browser gets/keeps profile-based anonymous token in local storage (`auth`)
5. UI creates/joins game and opens websocket connection

## 3. Server discovery pattern

The frontend does not hardcode backend server URLs. Instead it:

1. Calls `GET /api/servers` (`ui/pages/api/servers.ts`)
2. Route queries Mongo `servers` collection via `ui/utils/mango.ts`
3. Chooses one available server URL
4. Sends create/join requests to that backend URL

For local single-server dev, this is typically `http://localhost:8090`.

## 4. Auth model

### Backend JWT (game/backend auth)

- Issued by backend `/anon` for anonymous users
- Signed with `HMAC_SECRET`
- Verified in `server/jwt.go`
- Required on most backend routes (except `/anon`, `/heartbeat`)
- In this local profile flow, `/anon` uses selected username to attach fixed local profile IDs

### NextAuth JWT (OAuth/session)

- Used in Next.js auth route (`ui/pages/api/auth/[...nextauth].ts`)
- Signed with `NEXTAUTH_SECRET`
- Optional for local play if using anonymous auth only

## 5. Websocket model

Connection is created by session hooks:

- `ui/hooks/lobbySession.ts` (lobby lifecycle)
- `ui/hooks/gameSession.ts` (in-game lifecycle)

Both use transport in `ui/src/net/transport.ts` and protocol adaptation in `ui/src/protocol/adapter.ts`.

Socket URL format:

`ws(s)://<backend>/socket?id=<gameId>&token=<jwt>`

Backend `JWTMiddleware` supports reading token from query when upgrading websocket.

Messages are msgpack-encoded and parsed by `ui/src/sock.ts` types + adapter layer.

Inbound game messages are handled by `ui/src/store/gameRuntime.ts` (with Pixi rendering side-effects). `ui/src/ws.ts` is now a compatibility module for command hub/player context ownership.

## 6. Frontend state ownership

- Redux Toolkit store is configured in `ui/src/store/index.ts`.
- App root wires provider in `ui/pages/_app.tsx`.
- Lobby state: `ui/src/store/lobbySlice.ts` + `ui/src/store/connectionSlice.ts`.
- Game runtime state: `ui/src/store/gameSlice.ts`.

## 7. HUD layout ownership

- In-game HUD placement is centralized in `ui/src/hudLayout.ts`.
- Right-side stack (`Game Log`, `Chat`, `Resource Bank`, `Players`) is aligned via shared rail helpers.
- Bottom controls (`player hand`, `action/options`, `dice`, `timer`) derive positions from the same preset to keep spacing consistent across resolutions.

## Data Model (MongoDB collections)

Created/used through `mango/creator.go`, `mango/registry.go`, and `ui/utils/mango.ts`:

- `servers`: active backend servers + heartbeat timestamps
- `users`: player identities and profile-ish metadata
- `games`: game metadata and discovery data
- `game_states`: serialized game state snapshots
- `maps`: saved/custom maps

## Local Port Defaults

- Frontend: `3000`
- Backend: `8090`
- MongoDB: `27017`

## Local Customizations In This Repo

- Default local profiles: `Jethro7194`, `KopsTiKlapsa`, `staxtoPUTA`, `Giorgaros`
- Forced color mapping for those usernames:
  - `Jethro7194 -> blue`
  - `KopsTiKlapsa -> yellow`
  - `staxtoPUTA -> plum`
  - `Giorgaros -> red`
- Lobby UI is simplified to join/host flow (spectate removed from lobby controls)

## Production-ish Notes

- `deploy/` contains nginx snippets used by production infrastructure.
- Root and UI Dockerfiles build backend/frontend images for deployment.
- `docker-compose.yml` in root is only MongoDB by default (not full app stack).
