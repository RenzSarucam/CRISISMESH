# CrisisMesh API & Data Contract (v1)

This is the single source of truth for backend/frontend integration. Any agent building either side MUST conform to this exactly. If something is ambiguous, choose the most conventional Laravel/Next.js approach and note it here.

## Base

- API base URL: `http://localhost:8000/api/v1` (env: `NEXT_PUBLIC_API_URL` on frontend, `APP_URL` on backend)
- Auth: Laravel Sanctum, SPA token-based (Bearer token in `Authorization` header, stored in memory + IndexedDB session store on the client, NEVER localStorage for the raw token — use httpOnly-friendly pattern: Sanctum personal access token returned on login, kept in memory/IndexedDB `session` store).
- All responses use the envelope:

Success:
```json
{ "success": true, "data": {}, "message": "..." }
```
Error:
```json
{ "success": false, "message": "...", "errors": {} }
```

- Pagination (Laravel paginate()) wrapped as `data: { items: [...], meta: { current_page, last_page, per_page, total } }`.

## Enums (shared exactly, UPPER_SNAKE_CASE strings over the wire)

- IncidentType: MEDICAL, FIRE, FLOOD, LANDSLIDE, ROAD_BLOCKAGE, POWER_OUTAGE, WATER_SHORTAGE, MISSING_PERSON, SECURITY, EARTHQUAKE, STORM, OTHER
- Severity: LOW, MEDIUM, HIGH, CRITICAL
- IncidentStatus: REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, DISMISSED
- VerificationStatus: UNVERIFIED, COMMUNITY_CONFIRMED, RESPONDER_VERIFIED, ADMIN_VERIFIED, FALSE_REPORT
- Source: USER, RESPONDER, ADMIN, SYSTEM
- SosStatus: ACTIVE, ACKNOWLEDGED, RESPONDER_ASSIGNED, RESOLVED, CANCELLED
- ResourceType: WATER, FOOD, MEDICAL, SHELTER, POWER, CHARGING, FUEL, TRANSPORT, RESCUE_EQUIPMENT
- Availability: AVAILABLE, LIMITED, UNAVAILABLE, UNKNOWN
- EvacStatus: OPEN, FULL, CLOSED, UNKNOWN
- Role: citizen, responder, admin

## Core entities (field names, snake_case over the wire, camelCase in TS types via a mapper in `lib/api/client.ts`)

### User
id(uuid), name, email, phone, role, emergency_contact, avatar_url, device_id, last_active_at, created_at

### Device
id(uuid=device_id, format `cm-device-<uuid>`), user_id, device_name, platform, last_seen_at, last_sync_at, created_at

### Incident
id, uuid (client-generated), reporter_id, device_id, type, title, description, latitude, longitude, location_accuracy, severity, status, verification_status, source, created_offline(bool), synced_at, verified_by, verified_at, created_at, updated_at

### IncidentConfirmation
id, incident_id, user_id, role_at_time, type(CONFIRM|REJECT), note, created_at

### SosRequest
id, uuid, user_id, device_id, latitude, longitude, battery_percent, network_status, message, severity(default CRITICAL), status, acknowledged_by, acknowledged_at, assigned_responder_id, resolved_at, created_at

### Resource
id, uuid, name, type, description, latitude, longitude, availability, quantity, contact, operating_hours, verified(bool), last_updated_at

### EvacuationCenter
id, uuid, name, address, latitude, longitude, capacity, current_occupancy, contact, status, facilities(json array), verified(bool), updated_at

### EmergencyZone
id, uuid, name, type(FLOOD_ZONE|EVACUATION_ZONE|ROAD_CLOSED|HIGH_RISK|SAFE_ZONE), polygon(json array of [lat,lng]), description, active(bool), created_at

### AuditLog
id, user_id, action, entity, entity_id, ip_address, user_agent, created_at

### SyncOperation
id, device_id, operation_id(unique), type(CREATE_INCIDENT|CREATE_SOS|UPDATE_INCIDENT), payload(json), status(PENDING|APPLIED|FAILED), result_entity_id, processed_at, created_at

### Notification
id, user_id, type, title, body, read_at, data(json), created_at

## Endpoints (all under `/api/v1`, Sanctum `auth:sanctum` unless noted)

- POST /auth/register (public) {name,email,password,password_confirmation,role: citizen|responder} — role admin NOT allowed here
- POST /auth/login (public) {email,password} -> {user, token}
- POST /auth/logout
- GET /auth/me

- GET /incidents (paginate, filters: type,severity,status,verification_status,bbox,since)
- POST /incidents (citizen/responder/admin) — accepts client `uuid` for idempotency
- GET /incidents/{id}
- PUT /incidents/{id} (responder/admin)
- POST /incidents/{id}/verify {verification_status} (responder/admin) — logs confirmation
- POST /incidents/{id}/assign {responder_id} (admin)
- POST /incidents/{id}/resolve
- Dismiss: no dedicated endpoint — use `PUT /incidents/{id} {status: "DISMISSED"}` (responder/admin)

- GET /sos (responder/admin only; citizen sees own via /sos?mine=1)
- POST /sos (citizen) — rate-limited aggressively (throttle:3,1 per user)
- GET /sos/{id}
- POST /sos/{id}/acknowledge (responder/admin)
- POST /sos/{id}/assign {responder_id} (admin)
- POST /sos/{id}/resolve (responder/admin)

- GET /resources (public-readable when authenticated)
- POST /resources (admin)
- PUT /resources/{id} (admin) — also used for verify: `PUT {verified: true}`
- DELETE /resources/{id} (admin)

- GET /evacuation-centers
- POST /evacuation-centers (admin)
- PUT /evacuation-centers/{id} (admin)
- DELETE /evacuation-centers/{id} (admin)

- GET /users?role= (admin only — user directory, responder-assignment pickers)

- GET /zones
- POST /zones (admin)
- PUT /zones/{id} (admin)

- POST /sync {device_id, operations:[{operation_id, type, payload}]} -> idempotent, returns per-op result
- GET /dashboard/statistics (responder/admin)
- GET /audit-logs (admin)
- GET /system/status (public)

## Visibility rules (enforced via Policies, NOT just UI hiding)

- Citizens: incidents list returns approximate location only for others' reports (round to ~3 decimal, ~100m) unless it's their own report. SOS exact location never exposed to citizens other than their own.
- Responders/Admins: full precision on everything.
- Citizens cannot see other citizens' phone numbers ever.

## Sync idempotency

`sync_operations.operation_id` is unique per device. On duplicate submission, return the previously stored result without re-creating records. `incidents.uuid` and `sos_requests.uuid` are also unique — server upserts by uuid as a second safety net.

## Frontend offline contract (IndexedDB via Dexie, db name `crisisMeshDB`)

Stores: `incidents`, `sos_requests`, `resources_cache`, `evac_cache`, `sync_queue`, `session`.
Every locally created incident/sos gets a `uuid` (crypto.randomUUID()) immediately and a `syncStatus`: PENDING | SYNCING | SYNCED | SYNC_ERROR.
`SyncManager` (lib/offline/sync-manager.ts) drains `sync_queue` through a `MeshTransport` interface (lib/transport/mesh-transport.ts), of which `InternetTransport` is the only implementation for MVP, posting to `POST /sync`.
