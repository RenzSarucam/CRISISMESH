# Offline-First & Synchronization

## Why

Emergency reporting must work when the network doesn't. CrisisMesh's field app never blocks a report or SOS on connectivity — it writes to the device first, always.

## Local storage: `crisisMeshDB` (IndexedDB via Dexie)

| Store | Purpose |
|---|---|
| `incidents` | Every incident the device has created or cached, keyed by client `uuid`, carrying a `syncState`. |
| `sos_requests` | Same, for SOS. |
| `resources_cache` / `evac_cache` | Last-known server data, for offline viewing (spec §38). Never the source of truth — always overwritten by a fresh fetch when online. |
| `sync_queue` | Pending `SyncOperation`s: `{operation_id, type, payload, local_ref, attempts, next_attempt_at}`. |
| `session` | `{token, user}` — the only place the auth token is persisted (never `localStorage`). |
| `device` | This device's generated `device_id` (`cm-device-<uuid>`), created once and reused. |

## Lifecycle of a report

1. User submits the Report Incident or SOS form.
2. `lib/offline/actions.ts` generates a client `uuid` (`crypto.randomUUID()`) immediately, writes the full record to IndexedDB with `syncState: PENDING`, and enqueues a `SyncOperation` with its own unique `operation_id`.
3. The UI navigates away immediately — the user is never blocked on network I/O.
4. `SyncManager` (a singleton, started once at app load and on every `online` event) drains the queue via `MeshTransport.send()`.
5. On success, the record is updated to `SYNCED` and the operation is removed from the queue.
6. On failure, the operation's `attempts` increments and it's rescheduled with backoff: **immediate → 5s → 15s → 30s → 60s**. After 5 attempts it's marked `SYNC_ERROR` and stops auto-retrying; the Profile screen and the global offline banner both expose a manual "Retry" action that resets `attempts` to 0.

## Server-side idempotency

`POST /api/v1/sync` receives a batch of operations. `sync_operations.operation_id` is a unique column — if the same `operation_id` arrives twice (e.g. the client retried a request whose response was lost mid-flight), the server returns the **previously stored result** instead of reprocessing, so no duplicate incident/SOS is ever created. As a second safety net, `incidents.uuid` and `sos_requests.uuid` are also unique, so even a client bug that reused a uuid across two operation_ids can't create two rows — the second write upserts the first.

## Connection state shown to the user

Only four states exist, and the UI never shows anything else:

- **ONLINE** — `navigator.onLine` is true and the sync queue is empty (or all synced).
- **OFFLINE** — `navigator.onLine` is false.
- **SYNCING** — actively draining the queue.
- **SYNC_ERROR** — at least one operation exhausted its retries.

There is no "Bluetooth mesh connected" or "satellite" state anywhere in the MVP, because neither is implemented (see `docs/architecture.md`).
