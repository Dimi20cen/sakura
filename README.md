# SAKURA!

Open source game with mechanics similar to Catan.

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fsakura.radialapps.com&label=sakura.radialapps.com)](https://sakura.radialapps.com)
[![Blog](https://img.shields.io/website?url=https%3A%2F%2Fblog.sakura.app&label=blog)](https://blog.sakura.app)
[![License](https://img.shields.io/badge/license-AGPLv3-red)](./LICENSE)

![screenshot](./screenshot.jpg)

## Setup

- Set up MongoDB on your local machine or use a cloud service.
- Set environment variables in `.env` and `.env.local` file in `./ui` folder.
- Run `go run cmd/server/main.go`. Use `nodemon --signal SIGINT -e go --exec go run --race cmd/server/main.go` to watch backend changes and restart the server automatically.
- Run `npm run dev` in `./ui` to start the frontend.

## Game Modes

- `Basic` (Mode `1`)
- `Cities and Knights` (Mode `2`)
- `Seafarers` (Mode `3`)

### Seafarers MVP

The current Seafarers rollout includes:

- Ships as a separate buildable (`wood + wool`)
- Ship movement once per turn, before rolling dice
- Pirate behavior via robber-on-sea (blocks ship edge usage on adjacent edges)
- Longest trade route logic (roads + ships with settlement/city transition rule)
- Built-in official maps:
  - `Seafarers - Heading for New Shores`
  - `Seafarers - The Four Islands`
  - `Seafarers - The Fog Islands`
  - `Seafarers - Through the Desert`

Automated smoke coverage is in `game/seafarers_smoke_test.go`.
Detailed scope and parity tracking live in `docs/SEAFARERS_MVP.md` and `docs/SEAFARERS_PARITY_CHECKLIST.md`.

## License

All code in this repository is licensed under the AGPLv3 license. The copyright for the artwork is owned by the project owners and may not be used without permission.
