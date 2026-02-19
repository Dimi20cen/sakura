# Troubleshooting

Common issues when running Clash locally and how to resolve them.

## Backend fails to start with Mongo connection errors

Symptoms:

- Backend exits on startup
- Logs include Mongo auth/connection errors

Checks:

```bash
docker compose ps
docker compose logs --tail=100 mongodb
```

Fixes:

- Ensure Mongo container is running.
- Ensure `.env` has correct `MONGO_USER`/`MONGO_PASSWORD`.
- Ensure backend `MONGO_URL` matches credentials and includes `authSource=admin`.
- If container has old incompatible data, stop and remove volumes, then recreate (data-loss action).

## CORS errors in browser console

Symptoms:

- Requests from frontend to backend blocked by CORS

Fix:

- Set backend `.env` `FRONTEND_URL` exactly to your frontend origin, e.g.:
  - `http://localhost:3000`
- Restart backend after changing env.

## `No servers available :(` alert in UI

Cause:

- `GET /api/servers` returned empty list

Why this happens:

- Backend did not register heartbeat
- Next.js API route cannot read Mongo

Checks:

```bash
curl -i http://localhost:8090/heartbeat
curl -i http://localhost:3000/api/servers
```

Fixes:

- Confirm backend is running and reachable.
- Confirm frontend `ui/.env.local` has valid `MONGO_URL`.
- Confirm backend `.env` has valid `SERVER_URL`.

## `401 Unauthorized` from backend routes

Cause:

- Missing/invalid backend JWT in `Authorization` header (or websocket token query)

Fixes:

- Clear browser local storage key `auth` and reload.
- Confirm backend `HMAC_SECRET` is stable during your session.
- If you changed `HMAC_SECRET`, restart backend and refresh frontend session.

## Websocket connects then disconnects repeatedly

Checks:

- Browser devtools network tab for `/socket` status
- Backend logs for auth/game errors

Likely fixes:

- Ensure `gameServer` points to a live backend (`/heartbeat` returns 200).
- Ensure token is valid.
- Ensure game exists before joining.

## Mobile shows `404` when opening a newly hosted game

Symptoms:

- Hosting from mobile lands on `404` game page occasionally.

Fixes:

- Refresh once and retry host/join.
- Ensure backend and frontend are both running with current env values.
- Ensure only one active backend URL is being used in `servers` collection.

## Frontend fails with missing env values

Symptoms:

- Next.js runtime errors related to `process.env.*`

Fixes:

- Ensure `ui/.env.local` exists and includes required keys.
- Restart `npm run dev` after env changes (Next.js reads env on startup).

## `/choose-profile` problems

Symptoms:

- Profile page shows an error after selecting a profile.
- Selecting profile does not redirect to lobby.

Checks:

```bash
curl -i http://localhost:8090/heartbeat
curl -i http://localhost:3000/api/servers
```

Fixes:

- Ensure backend is running before selecting a profile.
- Ensure Mongo is up so `/api/servers` can resolve backend URLs.
- Refresh page after backend restart and reselect profile.
- If needed, clear `localStorage.auth` and `localStorage.profileUsername` and retry.

## Google sign-in does not work locally

Cause:

- Missing or invalid `GOOGLE_ID` / `GOOGLE_SECRET`

Fix:

- Configure Google OAuth credentials and callback URLs correctly.
- For regular local gameplay, use anonymous auth flow and skip Google OAuth.

## Port already in use

Find conflicting process:

```bash
ss -ltnp | rg ':3000|:8090|:27017'
```

Fix options:

- Stop existing process using the port
- Or change app ports and update env variables accordingly

## Works on host PC but not on phone/LAN device

Checks:

```bash
hostname -I | awk '{print $1}'
curl -i http://<YOUR_LAN_IP>:8090/heartbeat
```

Fixes:

- Start frontend with `npm run dev -- -H 0.0.0.0 -p 3000`.
- Set backend `.env` `HOST=0.0.0.0`.
- Set `SERVER_URL` and `FRONTEND_URL` to LAN IP-based URLs.
- Open firewall ports `3000` and `8090`.

## Quick reset path

When setup gets messy, try this order:

1. Stop frontend/backend processes
2. `docker compose down`
3. `docker compose up -d mongodb`
4. Verify `.env` and `ui/.env.local`
5. Start backend, then frontend
