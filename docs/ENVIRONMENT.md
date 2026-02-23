# Environment Variables

This project uses two environment files:

- Root backend env: `.env`
- Frontend env: `ui/.env.local`

Both backend and frontend are loaded via their runtime frameworks.

## Backend (`.env`)

Used by Go services in `cmd/server/main.go`, `server/*`, and `mango/*`.

### Required for local development

| Variable | Example | Used for |
| --- | --- | --- |
| `ENVIRONMENT` | `local` | Chooses local vs production Mongo config path (`mango/config.go`) |
| `MONGO_URL` | `mongodb://root:root@localhost:27017/sakura?authSource=admin` | MongoDB connection URI |
| `HMAC_SECRET` | `long-random-string` | Signs and verifies backend JWTs (`server/jwt.go`) |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin (`server/server.go`) |
| `HOST` | `0.0.0.0` | Backend bind host (`server/server.go`) |
| `PORT` | `8090` | Backend bind port (`server/server.go`) |
| `SERVER_URL` | `http://localhost:8090` | Value stored in servers registry heartbeat (`server/server.go`) |
| `AWS_REGION` | `us-east-1` | Passed to registry register call (currently informational in local flow) |
| `MONGO_USER` | `root` | Used by `docker-compose.yml` for Mongo init |
| `MONGO_PASSWORD` | `root` | Used by `docker-compose.yml` for Mongo init |

### Example `.env`

```env
ENVIRONMENT=local
MONGO_URL=mongodb://root:root@localhost:27017/sakura?authSource=admin
HMAC_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
HOST=0.0.0.0
PORT=8090
SERVER_URL=http://localhost:8090
AWS_REGION=us-east-1
MONGO_USER=root
MONGO_PASSWORD=root
```

## Frontend (`ui/.env.local`)

Used by Next.js pages and API routes in `ui/*`.

### Required for local development

| Variable | Example | Used for |
| --- | --- | --- |
| `MONGO_URL` | `mongodb://root:root@localhost:27017/sakura?authSource=admin` | Next.js API routes that query MongoDB (`ui/utils/mango.ts`) |
| `NEXTAUTH_SECRET` | `long-random-string` | NextAuth JWT encode/decode secret (`ui/utils/auth.ts`) |
| `NEXT_PUBLIC_ENVIRONMENT` | `local` | Toggles production-only analytics/ads in `_app.tsx` |

### Optional

| Variable | Example | Used for |
| --- | --- | --- |
| `GOOGLE_ID` | `<client-id>` | Google OAuth provider in `ui/pages/api/auth/[...nextauth].ts` |
| `GOOGLE_SECRET` | `<client-secret>` | Google OAuth provider in `ui/pages/api/auth/[...nextauth].ts` |
| `NEXT_PUBLIC_GA_ID` | `<ga-id>` | Google Analytics tag helper (`ui/utils/gtag.ts`) |

### Example `ui/.env.local`

```env
MONGO_URL=mongodb://root:root@localhost:27017/sakura?authSource=admin
NEXTAUTH_SECRET=replace-with-another-long-random-secret
NEXT_PUBLIC_ENVIRONMENT=local
GOOGLE_ID=
GOOGLE_SECRET=
```

## Secret Generation

Quick way to generate random secrets:

```bash
openssl rand -hex 32
```

Use one value for `HMAC_SECRET` and a different one for `NEXTAUTH_SECRET`.

## Common Mismatch Pitfalls

- Backend `FRONTEND_URL` must match your frontend origin exactly.
- `MONGO_URL` should include `authSource=admin` if using root credentials.
- If changing backend port, also update `SERVER_URL`.
- If changing frontend port, update `FRONTEND_URL`.

