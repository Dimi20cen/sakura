# Local Setup on Ubuntu

This guide walks through a clean local setup on Ubuntu 22.04/24.04.

## Overview

Imperials has:

- A Go backend (`cmd/server/main.go`) running on `:8090`
- A Next.js frontend (`ui`) running on `:3000`
- A MongoDB database (`imperials` database)

Backend and frontend both connect to MongoDB.

## 1. Install system packages

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release git build-essential
```

## 2. Install Docker Engine + Compose plugin

Follow Docker's official Ubuntu instructions, then verify:

```bash
docker --version
docker compose version
```

Optional (run Docker without `sudo`):

```bash
sudo usermod -aG docker "$USER"
newgrp docker
```

## 3. Install Go

Check your current version:

```bash
go version
```

Project minimum is Go `1.17` (`go.mod`). Any newer stable Go is fine.

## 4. Install Node.js and npm

Check versions:

```bash
node -v
npm -v
```

The frontend (`ui/package.json`) is built around Node 18 ecosystem. Node 18+ is recommended.

## 5. Clone repo

```bash
git clone <your-fork-or-repo-url> imperials
cd imperials
```

## 6. Create environment files

### Root `.env`

Create `/path/to/imperials/.env`:

```env
ENVIRONMENT=local
MONGO_URL=mongodb://root:root@localhost:27017/imperials?authSource=admin
HMAC_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
HOST=0.0.0.0
PORT=8090
SERVER_URL=http://localhost:8090
AWS_REGION=us-east-1
MONGO_USER=root
MONGO_PASSWORD=root
```

### Frontend `ui/.env.local`

Create `/path/to/imperials/ui/.env.local`:

```env
MONGO_URL=mongodb://root:root@localhost:27017/imperials?authSource=admin
NEXTAUTH_SECRET=replace-with-another-long-random-secret
NEXT_PUBLIC_ENVIRONMENT=local
GOOGLE_ID=
GOOGLE_SECRET=
```

## 7. Start MongoDB

From repo root:

```bash
docker compose up -d mongodb
docker compose ps
```

You should see container `mongo` in `running` state and port `27017` published.

## 8. Install frontend dependencies

```bash
cd ui
npm install
cd ..
```

## 9. Start backend

In terminal 1 (repo root):

```bash
go run cmd/server/main.go
```

Expected logs include:

- `Connected to MongoDB!`
- `Starting the Imperial backend on 0.0.0.0:8090`

## 10. Start frontend

In terminal 2:

```bash
cd ui
npm run dev
```

Expected:

- Next dev server on `http://localhost:3000`

## 11. Open app

- Main page: `http://localhost:3000`
- Lobby: `http://localhost:3000/lobby`
- Single player entry: `http://localhost:3000/sp`
- Profile selection: `http://localhost:3000/choose-profile`

On first local use, pick one profile from:

- `Jethro7194` (blue)
- `KopsTiKlapsa` (yellow)
- `staxtoPUTA` (plum)
- `Giorgaros` (red)

The selection is saved in browser local storage and can be changed later from `/choose-profile`.

## 12. Verify full stack health

Backend health:

```bash
curl -i http://localhost:8090/heartbeat
```

Expected `HTTP/1.1 200 OK` and body `OK`.

Mongo container:

```bash
docker compose logs --tail=50 mongodb
```

Frontend API (through Next.js):

```bash
curl -i http://localhost:3000/api/servers
```

Should return JSON with `servers` array (including `http://localhost:8090` once backend heartbeat has registered).

## 13. Stop services

Stop frontend/backend with `Ctrl+C` in their terminals.

Stop Mongo container:

```bash
docker compose down
```

## 14. Access From Mobile on Same Network

1. Find your LAN IP:

```bash
hostname -I | awk '{print $1}'
```

2. Update root `.env`:

```env
HOST=0.0.0.0
PORT=8090
SERVER_URL=http://<YOUR_LAN_IP>:8090
FRONTEND_URL=http://<YOUR_LAN_IP>:3000
```

3. Run frontend bound to all interfaces:

```bash
cd ui
npm run dev -- -H 0.0.0.0 -p 3000
```

4. Open firewall ports:

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 8090/tcp
```

5. Open from phone or tablet on same Wi-Fi:

- `http://<YOUR_LAN_IP>:3000`

## 15. Access From Different Networks (Friends)

Recommended:

- Use Tailscale for private cross-network access without exposing ports publicly.

Alternative:

- Port-forward frontend/backend and set public URLs in `SERVER_URL` and `FRONTEND_URL`.
- If Google sign-in is used, update OAuth callback URLs accordingly.

## Optional: Backend auto-restart

From repo root:

```bash
npx nodemon --signal SIGINT -e go --exec "go run --race cmd/server/main.go"
```

This mirrors the suggestion in the root `README.md`.

## Notes About Auth

- Anonymous auth works immediately via backend `/anon`.
- Google OAuth requires valid `GOOGLE_ID` and `GOOGLE_SECRET` in `ui/.env.local`.
- Local gameplay does not require Google OAuth if anonymous flow is enough.
