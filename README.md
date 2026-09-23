# CrisisMesh

**Communication when the network fails.**

CrisisMesh is an emergency communication and coordination platform for
communities and responders operating where internet connectivity is
unreliable, congested, or partially disrupted. Citizens can report incidents
and send SOS requests entirely offline; a command center gives responders
and administrators a live operational picture once those reports sync back.

This is an MVP. It does not claim capabilities it doesn't have — see
[Known limitations](#known-limitations).

---

## Features

- **Offline-first field app (PWA)** — create incident reports and SOS
  requests with zero connectivity; everything queues locally and syncs
  automatically when the network returns.
- **SOS** — press-and-hold confirmation, exact location shared only with
  responders/admins, aggressively rate-limited server-side.
- **Command Center** — live map, incident/SOS management, resource and
  evacuation-center management, analytics, audit logs, system status.
- **Verification workflow** — every report starts `UNVERIFIED`; community,
  responder, and admin confirmations are tracked separately. AI never
  verifies a report — see [`docs/security.md`](docs/security.md).
- **Role-based access** — citizen / responder / admin, enforced by Laravel
  Policies on the server, not just hidden in the UI.
- **Full audit trail** for every sensitive action.

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown,
[`docs/offline-sync.md`](docs/offline-sync.md) for how offline sync and
idempotency work, [`docs/security.md`](docs/security.md) for the data
visibility model, and [`docs/contract.md`](docs/contract.md) for the exact
API/data contract both the frontend and backend are built against.

```
Field PWA (citizen)  ──┐
                        ├──►  Laravel API (Sanctum, /api/v1)  ──►  MySQL 8
Command Center (staff)─┘
```

The field app and command center are one Next.js deployment, split by route
group and role-based redirect.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4, shadcn/ui, TanStack Query, Leaflet + OpenStreetMap, Zod, React Hook Form, Recharts, Dexie (IndexedDB) |
| Backend | Laravel 12, PHP 8.3, Sanctum, MySQL 8 |
| Infra | Docker Compose (frontend, backend, mysql), GitHub Actions CI |

## Project structure

```
crisis-mesh/
├── frontend/     Next.js app — field PWA + command center
├── backend/      Laravel 12 API
├── docker/       Shared container configs (nginx, supervisord, entrypoint)
├── docs/         Architecture, offline-sync, security, API contract
├── scripts/      Local dev helper scripts
├── docker-compose.yml
└── Makefile
```

---

## Running locally

### Option A — Docker Compose (recommended once Docker is installed)

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec backend php artisan migrate --seed
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- MySQL: localhost:3306

### Option B — Without Docker (what this repo was actually developed and
verified against in this environment, since Docker Desktop wasn't available)

**Backend:**

```bash
cd backend
composer install
cp .env.example .env
# For local dev without MySQL, set in .env:
#   DB_CONNECTION=sqlite
#   DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
touch database/database.sqlite
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

**Frontend** (in a second terminal):

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1" > .env.local
npm run dev
```

Then open http://localhost:3000.

> **Note on `next dev` + the service worker:** the PWA's offline behavior
> (precached routes, offline fallback) is only meaningful against a
> **production build** (`npm run build && npm run start`) — `next dev`
> recompiles chunks on demand with non-deterministic hashes, so the service
> worker's precache can't reliably serve them. For any offline/PWA testing,
> use the production build.

## Demo accounts

Seeded by `php artisan db:seed` (see `backend/database/seeders/DatabaseSeeder.php`).
The admin account is fixed; responder/citizen emails are randomized per seed
run and printed to the console — re-run the seeder to see the current ones.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@crisismesh.test` | `password` |
| Responder | *(printed on seed)* | `password` |
| Citizen | *(printed on seed)* | `password` |

All demo data is centered on Davao City, Philippines.

## Testing

```bash
# Backend (10 feature tests: auth, incidents, sync idempotency, SOS rate limiting,
# verification policies, location-privacy rounding)
cd backend && php artisan test

# Frontend (offline actions, sync-queue retry/backoff, MeshTransport contract)
cd frontend && npm test

# Frontend type-check + lint
cd frontend && npx tsc --noEmit && npx eslint .
```

## Offline architecture (short version)

Reports and SOS requests are written to IndexedDB first, with a client-
generated UUID, before any network call happens. A `SyncManager` drains a
queue against the API with retry backoff (immediate → 5s → 15s → 30s → 60s,
then `SYNC_ERROR` with a manual retry option). The server treats sync
operations as idempotent by `operation_id`, so a retried request never
creates a duplicate record. Full detail: [`docs/offline-sync.md`](docs/offline-sync.md).

## Security model (short version)

Sanctum bearer tokens, server-side Policies on every write, location
rounded to ~110m for citizens viewing other people's reports (never for
SOS), aggressive SOS rate limiting, full audit log of sensitive actions.
Full detail: [`docs/security.md`](docs/security.md).

## Known limitations

- **No real mesh networking.** `lib/transport/mesh-transport.ts` defines a
  `MeshTransport` interface with three classes: `InternetTransport` (the only
  one that works — a plain HTTPS POST to `/api/v1/sync`), and
  `BluetoothTransport` / `WifiDirectTransport`, which exist only as typed
  stubs that throw if called. There is no Bluetooth/Wi-Fi Direct mesh in this
  MVP — see the Future Roadmap below for how a native app could add it.
- **AI is a naive heuristic**, not a real model. `AiSuggestionService` does
  keyword matching, not ML inference, and never marks anything "verified."
- **Docker Compose is written but not exercised end-to-end in this
  environment** (Docker Desktop wasn't installed during development here —
  see the no-Docker instructions above, which is what was actually run and
  tested). Review the Dockerfiles/compose file before relying on them in
  production.
- **`GET /users`, resource/evacuation-center `DELETE`, and incident
  "dismiss"** were added to the backend during integration to match what the
  command center actually needed; they're documented in `docs/contract.md`
  but were not in the original spec's endpoint list.
- No push notifications — the notification system is in-app only, per the
  MVP spec.
- Settings/profile editing is read-only (no `PUT /auth/me` endpoint yet).

## Future roadmap

- Native React Native app implementing `BluetoothTransport` /
  `WifiDirectTransport` for true device-to-device store-and-forward mesh
  delivery when no internet gateway is reachable at all.
- Push notifications (web push + native).
- Pluggable real LLM provider behind `AiSuggestionService`'s existing
  interface.
- Profile self-service (`PUT /auth/me`), password reset flow.
- Redis-backed queues/cache if load requires it (deliberately excluded from
  the MVP per the original spec).

## Environment variables

See [`.env.example`](.env.example) (Docker Compose) and
`backend/.env.example` / a frontend `.env.local` with `NEXT_PUBLIC_API_URL`
for the full list, each documented inline.
