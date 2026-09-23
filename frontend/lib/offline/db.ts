import Dexie, { type Table } from "dexie";
import type { Incident, SosRequest, Resource, EvacuationCenter, User, SyncState } from "@/types";

export interface QueuedOperation {
  operation_id: string;
  type: "CREATE_INCIDENT" | "CREATE_SOS";
  payload: unknown;
  local_ref: string; // uuid of the incident/sos this op belongs to, for status updates
  attempts: number;
  next_attempt_at: number; // epoch ms
  last_error?: string;
  created_at: number;
}

export interface SessionRecord {
  id: "current";
  token: string;
  user: User;
}

export interface DeviceRecord {
  id: "current";
  device_id: string;
  device_name: string;
  platform: string;
}

/** Local cache of an incident, keyed by client uuid. Carries syncState so the
 * UI can show PENDING/SYNCING/SYNCED/SYNC_ERROR per record. */
export interface LocalIncident extends Incident {
  syncState: SyncState;
}

export interface LocalSos extends SosRequest {
  syncState: SyncState;
}

class CrisisMeshDB extends Dexie {
  incidents!: Table<LocalIncident, string>;
  sos_requests!: Table<LocalSos, string>;
  resources_cache!: Table<Resource, string>;
  evac_cache!: Table<EvacuationCenter, string>;
  sync_queue!: Table<QueuedOperation, string>;
  session!: Table<SessionRecord, string>;
  device!: Table<DeviceRecord, string>;

  constructor() {
    super("crisisMeshDB");
    this.version(1).stores({
      incidents: "uuid, status, severity, syncState, created_at",
      sos_requests: "uuid, status, syncState, created_at",
      resources_cache: "uuid, type, availability",
      evac_cache: "uuid, status",
      sync_queue: "operation_id, local_ref, next_attempt_at",
      session: "id",
      device: "id",
    });
  }
}

export const db = new CrisisMeshDB();

export async function getSession(): Promise<SessionRecord | undefined> {
  return db.session.get("current");
}

export async function setSession(data: { token: string; user: User }) {
  await db.session.put({ id: "current", ...data });
}

export async function clearSession() {
  await db.session.delete("current");
}

export async function getOrCreateDevice(): Promise<DeviceRecord> {
  const existing = await db.device.get("current");
  if (existing) return existing;
  const device: DeviceRecord = {
    id: "current",
    device_id: `cm-device-${crypto.randomUUID()}`,
    device_name:
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 60) : "unknown-device",
    platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
  };
  await db.device.put(device);
  return device;
}
