import { db, getOrCreateDevice, getSession } from "@/lib/offline/db";
import { syncManager } from "@/lib/offline/sync-manager";
import { getBatteryPercent } from "@/lib/geolocation";
import type {
  Incident,
  IncidentType,
  Severity,
  SosRequest,
} from "@/types";

export interface CreateIncidentInput {
  type: IncidentType;
  title: string;
  description: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  location_accuracy: number | null;
}

/**
 * Creates an incident locally first (offline-first, spec section 12): the
 * record gets a UUID and PENDING sync state immediately, is written to
 * IndexedDB, and is queued for sync. Works identically online or offline —
 * the only difference is how quickly SyncManager drains the queue.
 */
export async function createIncidentOffline(input: CreateIncidentInput): Promise<Incident> {
  const session = await getSession();
  const device = await getOrCreateDevice();
  const uuid = crypto.randomUUID();
  const now = new Date().toISOString();
  const wasOffline = typeof navigator !== "undefined" && !navigator.onLine;

  const incident: Incident & { syncState: "PENDING" } = {
    id: uuid,
    uuid,
    reporter_id: session?.user.id ?? null,
    device_id: device.device_id,
    type: input.type,
    title: input.title,
    description: input.description,
    latitude: input.latitude,
    longitude: input.longitude,
    location_accuracy: input.location_accuracy,
    severity: input.severity,
    status: "REPORTED",
    verification_status: "UNVERIFIED",
    source: "USER",
    created_offline: wasOffline,
    synced_at: null,
    verified_by: null,
    verified_at: null,
    created_at: now,
    updated_at: now,
    syncState: "PENDING",
  };

  await db.incidents.put(incident);
  await syncManager.enqueue({
    operation_id: crypto.randomUUID(),
    type: "CREATE_INCIDENT",
    local_ref: uuid,
    payload: {
      uuid,
      device_id: device.device_id,
      type: input.type,
      title: input.title,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      location_accuracy: input.location_accuracy,
      severity: input.severity,
      created_offline: wasOffline,
    },
  });

  return incident;
}

export interface CreateSosInput {
  latitude: number;
  longitude: number;
  message: string | null;
}

export async function createSosOffline(input: CreateSosInput): Promise<SosRequest> {
  const session = await getSession();
  const device = await getOrCreateDevice();
  const uuid = crypto.randomUUID();
  const now = new Date().toISOString();
  const online = typeof navigator !== "undefined" && navigator.onLine;
  const battery = await getBatteryPercent();

  const sos: SosRequest & { syncState: "PENDING" } = {
    id: uuid,
    uuid,
    user_id: session?.user.id ?? "",
    device_id: device.device_id,
    latitude: input.latitude,
    longitude: input.longitude,
    battery_percent: battery,
    network_status: online ? "ONLINE" : "OFFLINE",
    message: input.message,
    severity: "CRITICAL",
    status: "ACTIVE",
    acknowledged_by: null,
    acknowledged_at: null,
    assigned_responder_id: null,
    resolved_at: null,
    created_at: now,
    syncState: "PENDING",
  };

  await db.sos_requests.put(sos);
  await syncManager.enqueue({
    operation_id: crypto.randomUUID(),
    type: "CREATE_SOS",
    local_ref: uuid,
    payload: {
      uuid,
      device_id: device.device_id,
      latitude: input.latitude,
      longitude: input.longitude,
      battery_percent: battery,
      network_status: online ? "ONLINE" : "OFFLINE",
      message: input.message,
      severity: "CRITICAL",
    },
  });

  return sos;
}
