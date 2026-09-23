// Shared domain types for CrisisMesh. Mirrors docs/contract.md exactly.
// Wire format uses UPPER_SNAKE_CASE string enums and snake_case fields.

export type Role = "citizen" | "responder" | "admin";

export type IncidentType =
  | "MEDICAL"
  | "FIRE"
  | "FLOOD"
  | "LANDSLIDE"
  | "ROAD_BLOCKAGE"
  | "POWER_OUTAGE"
  | "WATER_SHORTAGE"
  | "MISSING_PERSON"
  | "SECURITY"
  | "EARTHQUAKE"
  | "STORM"
  | "OTHER";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "REPORTED"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "DISMISSED";

export type VerificationStatus =
  | "UNVERIFIED"
  | "COMMUNITY_CONFIRMED"
  | "RESPONDER_VERIFIED"
  | "ADMIN_VERIFIED"
  | "FALSE_REPORT";

export type ReportSource = "USER" | "RESPONDER" | "ADMIN" | "SYSTEM";

export type SosStatus =
  | "ACTIVE"
  | "ACKNOWLEDGED"
  | "RESPONDER_ASSIGNED"
  | "RESOLVED"
  | "CANCELLED";

export type ResourceType =
  | "WATER"
  | "FOOD"
  | "MEDICAL"
  | "SHELTER"
  | "POWER"
  | "CHARGING"
  | "FUEL"
  | "TRANSPORT"
  | "RESCUE_EQUIPMENT";

export type Availability = "AVAILABLE" | "LIMITED" | "UNAVAILABLE" | "UNKNOWN";

export type EvacStatus = "OPEN" | "FULL" | "CLOSED" | "UNKNOWN";

export type ZoneType =
  | "FLOOD_ZONE"
  | "EVACUATION_ZONE"
  | "ROAD_CLOSED"
  | "HIGH_RISK"
  | "SAFE_ZONE";

/** Client-side sync lifecycle for a locally-created record. Distinct from
 * server-side IncidentStatus/SosStatus — this tracks whether the record
 * has left the device yet. */
export type SyncState = "PENDING" | "SYNCING" | "SYNCED" | "SYNC_ERROR";

/** App-wide connectivity indicator shown in the nav/status banner. */
export type ConnectionState = "ONLINE" | "OFFLINE" | "SYNCING" | "SYNC_ERROR";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  emergency_contact?: string | null;
  avatar_url?: string | null;
  device_id?: string | null;
  last_active_at?: string | null;
  created_at: string;
}

export interface Incident {
  id: string;
  uuid: string;
  reporter_id: string | null;
  reporter_name?: string | null;
  device_id: string | null;
  type: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_accuracy: number | null;
  severity: Severity;
  status: IncidentStatus;
  verification_status: VerificationStatus;
  source: ReportSource;
  created_offline: boolean;
  synced_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  possible_duplicates?: string[];
  confirmations_count?: number;
  created_at: string;
  updated_at: string;
  // Client-only fields (never sent to server), present on locally-cached rows
  syncState?: SyncState;
}

export interface SosRequest {
  id: string;
  uuid: string;
  user_id: string;
  user_name?: string | null;
  device_id: string | null;
  latitude: number;
  longitude: number;
  battery_percent: number | null;
  network_status: "ONLINE" | "OFFLINE";
  message: string | null;
  severity: Severity;
  status: SosStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  assigned_responder_id: string | null;
  resolved_at: string | null;
  created_at: string;
  syncState?: SyncState;
}

export interface Resource {
  id: string;
  uuid: string;
  name: string;
  type: ResourceType;
  description: string | null;
  latitude: number;
  longitude: number;
  availability: Availability;
  quantity: number | null;
  contact: string | null;
  operating_hours: string | null;
  verified: boolean;
  last_updated_at: string;
}

export interface EvacuationCenter {
  id: string;
  uuid: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact: string | null;
  status: EvacStatus;
  facilities: string[];
  verified: boolean;
  updated_at: string;
}

export interface EmergencyZone {
  id: string;
  uuid: string;
  name: string;
  type: ZoneType;
  polygon: [number, number][];
  description: string | null;
  active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DashboardStatistics {
  active_incidents: number;
  active_sos: number;
  unverified_reports: number;
  responders_online: number;
  evacuation_capacity_remaining: number;
  offline_devices: number;
  sync_errors: number;
  incidents_over_time: { date: string; count: number }[];
  incidents_by_type: { type: IncidentType; count: number }[];
  incidents_by_severity: { severity: Severity; count: number }[];
  sos_response_time_minutes: { id: string; minutes: number }[];
  verification_breakdown: { status: VerificationStatus; count: number }[];
}

export interface SystemStatus {
  api_status: "OPERATIONAL" | "DEGRADED" | "DOWN";
  database_status: "OPERATIONAL" | "DEGRADED" | "DOWN";
  app_version: string;
  server_time: string;
  last_synchronization: string | null;
  active_users: number;
  pending_sync_operations: number;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** AI-assisted suggestion — always requires human verification, never a verdict of truth. */
export interface AiSuggestion {
  type: IncidentType;
  severity: Severity;
  summary: string;
  confidence: number;
}
