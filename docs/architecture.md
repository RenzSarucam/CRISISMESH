# CrisisMesh Architecture

## Overview

CrisisMesh is a monorepo with three deployable pieces:

```
┌─────────────────────┐        ┌──────────────────────┐        ┌───────────────┐
│  Field PWA (citizen) │  HTTPS │  Laravel API (v1)    │  SQL   │   MySQL 8     │
│  Next.js + IndexedDB │◄──────►│  Sanctum auth        │◄──────►│               │
│  offline-first       │        │  Policies/Resources  │        └───────────────┘
└─────────┬────────────┘        └──────────┬───────────┘
          │ same Next.js app,               │
          │ different route group           │
┌─────────▼────────────┐                    │
│ Command Center        │◄───────────────────┘
│ (responder/admin)     │
│ Next.js + React Query │
└────────────────────────┘
```

The field app and command center are the **same Next.js deployment**, split by route group (`app/(field)/*` for citizens, `app/dashboard/*` for responders/admins) and by role-based redirect from `/`. They share one API client (`lib/api/client.ts`) and one type layer (`types/index.ts`), which mirrors `docs/contract.md` — the single source of truth both sides were built against.

## Client layers (frontend)

- **`types/`** — TypeScript types mirroring the wire format exactly (UPPER_SNAKE_CASE enums, snake_case fields).
- **`lib/api/client.ts`** — thin fetch wrapper: unwraps the `{success,data,message}` envelope, attaches the bearer token from the in-memory cache (primed from IndexedDB on load), throws `ApiClientError` with status/validation errors.
- **`lib/offline/db.ts`** — Dexie schema for `crisisMeshDB` (see `docs/offline-sync.md`).
- **`lib/offline/actions.ts`** — `createIncidentOffline` / `createSosOffline`: write-local-first entry points used by every report/SOS form, online or offline.
- **`lib/offline/sync-manager.ts`** — drains the sync queue, exposes `ONLINE | OFFLINE | SYNCING | SYNC_ERROR` to the UI.
- **`lib/transport/mesh-transport.ts`** — see "Future mesh layer" below.

## Server layers (backend)

Standard Laravel layering, kept intentionally boring:

- **Controllers** — thin, one action per route, no business logic.
- **Form Requests** — all validation.
- **Policies** — all authorization (citizen/responder/admin rules from `docs/contract.md`).
- **API Resources** — all serialization, including the location-privacy rounding rule (citizens see ~110m-rounded coordinates on other people's reports).
- **Services** — business logic that doesn't belong in a model or controller (audit logging, duplicate detection, AI-assisted classification, sync idempotency).
- **Events/Listeners** — `SosCreated`, `IncidentVerified` etc., mostly used to drive audit logging without cluttering controllers.

## Data visibility model

Enforced in Policies and API Resources, not just hidden in the UI (see `docs/security.md` for the full breakdown):

| Data | Citizen (own) | Citizen (others') | Responder | Admin |
|---|---|---|---|---|
| Incident location | exact | rounded ~110m | exact | exact |
| SOS location | exact | not visible | exact | exact |
| Phone numbers | own only | never | own + assigned | all |

## Future mesh architecture (NOT implemented in this MVP)

`lib/transport/mesh-transport.ts` defines a `MeshTransport` interface with one real implementation, `InternetTransport` (a plain HTTPS POST to `/api/v1/sync`). Two more classes exist as **documented stubs that throw if called** — `BluetoothTransport` and `WifiDirectTransport` — so the `SyncManager` and every screen that calls it already code against the interface, not a concrete HTTP call. A future React Native app could implement true store-and-forward mesh delivery this way:

```
Device A (offline) → BLE/Wi-Fi Direct → Device B → ... → Device with internet → Gateway → CrisisMesh API
```

That would require, on the native side: peer discovery, message TTL, message IDs for deduplication, and eventual-consistency delivery — none of which exists today. Nothing in this codebase claims otherwise; the UI only ever shows real ONLINE/OFFLINE/SYNCING/SYNC_ERROR state from `InternetTransport`.

## AI assistant

`app/Services/AiSuggestionService.php` is a naive keyword-based heuristic (type/severity/summary/confidence) with no external API calls. It is architected so a real LLM provider can be swapped in later behind the same interface. Its output is always labeled "AI-assisted suggestion — requires human verification" and never auto-verifies a report — verification status changes only through the human verification endpoints.
