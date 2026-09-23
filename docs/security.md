# Security & Data Visibility Model

## Authentication

- Laravel Sanctum personal access tokens (SPA/mobile-style bearer tokens, not cookie sessions).
- Passwords hashed with bcrypt (Laravel default), never logged or returned in any API response.
- Public registration (`POST /auth/register`) rejects `role: admin` at the Form Request level — admin accounts only exist via the database seeder.
- The auth token is kept in memory for the life of the tab and persisted only in IndexedDB (`lib/offline/db.ts`'s `session` store) — never in `localStorage`/`sessionStorage`, so it isn't trivially readable by a same-origin script relying on those APIs, and it's cleared on 401 and on logout.

## Authorization

Every write endpoint is guarded by a Policy, not just hidden in the UI:

- Citizens can create incidents/SOS and read/update only their own.
- Responders can update incidents/SOS assigned to them and acknowledge/resolve SOS.
- Admins can verify, assign, manage resources/evacuation centers/zones, and view audit logs/analytics.

## Data visibility (see `docs/contract.md` for the exact rule)

- Citizens viewing incidents that aren't their own get **coordinates rounded to 3 decimal places (~110m)**. Their own reports and anything a responder/admin views is full precision.
- SOS exact location is **never** exposed to citizens other than the person who sent it — only responders/admins see exact SOS coordinates.
- Phone numbers are never included in any response a citizen receives about another user.

## Rate limiting

- `POST /api/v1/sos` is throttled aggressively (5/minute per authenticated user) — a panicking user mashing the button doesn't spam responders with duplicate active SOS records, but a genuine repeated press within the window still succeeds.
- Standard Sanctum/API throttling applies elsewhere via Laravel's default `throttle:api` middleware group.

## Input handling

- All writes go through Form Requests (server-side validation, independent of whatever the client already validated with Zod).
- All reads go through API Resources (no raw Eloquent model ever serializes directly to JSON), which is also where the location-rounding rule lives.
- Laravel's query builder / Eloquent parameterizes all queries — no raw SQL string concatenation.
- React renders all user content through JSX (auto-escaped) — no `dangerouslySetInnerHTML` anywhere in incident/SOS rendering paths.

## Audit logging

Every sensitive action listed in spec §32 (`USER_LOGIN`, `INCIDENT_VERIFIED`, `SOS_ACKNOWLEDGED`, etc.) is written to `audit_logs` with the acting user, IP, and user agent, via `AuditLogService`. Audit logs are admin-only to read (`GET /api/v1/audit-logs`).

## What this MVP does NOT claim

- No AI system "verifies" a report — AI output is always labeled "AI-assisted suggestion — requires human verification" and cannot change `verification_status` on its own.
- No Bluetooth mesh, Wi-Fi Direct, or satellite transport exists yet — see `docs/architecture.md`'s Future Mesh section. The only active `MeshTransport` is `InternetTransport`.
