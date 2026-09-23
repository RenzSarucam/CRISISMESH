import { db, getOrCreateDevice, type QueuedOperation } from "@/lib/offline/db";
import { InternetTransport, type MeshTransport } from "@/lib/transport/mesh-transport";
import { primeAuthFromStorage } from "@/lib/api/client";
import type { ConnectionState } from "@/types";

const RETRY_DELAYS_MS = [0, 5_000, 15_000, 30_000, 60_000];
const MAX_ATTEMPTS = 5;

type Listener = (state: ConnectionState) => void;

/**
 * Owns the offline sync queue. Reports state as ONLINE / OFFLINE / SYNCING /
 * SYNC_ERROR so the UI can show a single, honest connectivity indicator.
 * Retries failed operations with backoff up to MAX_ATTEMPTS, then leaves them
 * in SYNC_ERROR for a manual retry (see retryFailed()).
 */
class SyncManager {
  private transport: MeshTransport;
  private listeners = new Set<Listener>();
  private state: ConnectionState = "OFFLINE";
  private draining = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    this.transport = new InternetTransport(apiUrl, primeAuthFromStorage);
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleConnectivityChange());
      window.addEventListener("offline", () => this.handleConnectivityChange());
      this.state = navigator.onLine ? "ONLINE" : "OFFLINE";
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  private setState(state: ConnectionState) {
    this.state = state;
    for (const l of this.listeners) l(state);
  }

  private handleConnectivityChange() {
    if (navigator.onLine) {
      this.setState("ONLINE");
      void this.drain();
    } else {
      this.setState("OFFLINE");
    }
  }

  async enqueue(op: Omit<QueuedOperation, "attempts" | "next_attempt_at" | "created_at">) {
    await db.sync_queue.put({
      ...op,
      attempts: 0,
      next_attempt_at: Date.now(),
      created_at: Date.now(),
    });
    if (typeof navigator !== "undefined" && navigator.onLine) {
      void this.drain();
    }
  }

  async retryFailed() {
    const failed = await db.sync_queue.where("next_attempt_at").belowOrEqual(Date.now()).toArray();
    for (const op of failed) {
      await db.sync_queue.update(op.operation_id, { attempts: 0, next_attempt_at: Date.now() });
    }
    void this.drain();
  }

  async drain() {
    if (this.draining) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.setState("OFFLINE");
      return;
    }
    this.draining = true;
    this.setState("SYNCING");
    try {
      const device = await getOrCreateDevice();
      let hadError = false;

      while (true) {
        const due = await db.sync_queue
          .where("next_attempt_at")
          .belowOrEqual(Date.now())
          .toArray();
        const pending = due.filter((op) => op.attempts < MAX_ATTEMPTS);
        if (pending.length === 0) break;

        try {
          const results = await this.transport.send(device.device_id, pending);
          for (const result of results) {
            const op = pending.find((p) => p.operation_id === result.operation_id);
            if (!op) continue;
            if (result.success) {
              await this.markSynced(op);
              await db.sync_queue.delete(op.operation_id);
            } else {
              await this.markRetry(op, result.error);
              hadError = true;
            }
          }
        } catch (err) {
          // Whole batch failed (network drop mid-flight) — back off every op in it.
          for (const op of pending) {
            await this.markRetry(op, err instanceof Error ? err.message : "Unknown error");
          }
          hadError = true;
          break;
        }
      }

      const stillQueued = await db.sync_queue.count();
      if (hadError && stillQueued > 0) {
        this.setState("SYNC_ERROR");
      } else {
        this.setState(navigator.onLine ? "ONLINE" : "OFFLINE");
      }
    } finally {
      this.draining = false;
      this.scheduleNextDrain();
    }
  }

  private async markSynced(op: QueuedOperation) {
    if (op.type === "CREATE_INCIDENT") {
      await db.incidents.update(op.local_ref, { syncState: "SYNCED", synced_at: new Date().toISOString() });
    } else if (op.type === "CREATE_SOS") {
      await db.sos_requests.update(op.local_ref, { syncState: "SYNCED" });
    }
  }

  private async markRetry(op: QueuedOperation, error?: string) {
    const attempts = op.attempts + 1;
    const delay = RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length - 1)];
    await db.sync_queue.update(op.operation_id, {
      attempts,
      next_attempt_at: Date.now() + delay,
      last_error: error,
    });
    const finalState = attempts >= MAX_ATTEMPTS ? "SYNC_ERROR" : "PENDING";
    if (op.type === "CREATE_INCIDENT") {
      await db.incidents.update(op.local_ref, { syncState: finalState });
    } else if (op.type === "CREATE_SOS") {
      await db.sos_requests.update(op.local_ref, { syncState: finalState });
    }
  }

  private scheduleNextDrain() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.onLine) void this.drain();
    }, 20_000);
  }
}

export const syncManager = new SyncManager();
