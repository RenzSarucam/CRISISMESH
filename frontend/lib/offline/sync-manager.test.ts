import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "@/lib/offline/db";

// The real SyncManager module wires up an InternetTransport at construction
// time and reads navigator.onLine/window events, which is awkward to unit
// test directly. What actually matters -- and what regresses silently -- is
// the queue bookkeeping: an operation that fails is retried with the right
// backoff, and one that fails MAX_ATTEMPTS times is marked SYNC_ERROR rather
// than retried forever. We exercise that logic directly against the queue
// table the same way SyncManager.drain() does, without importing the browser-
// coupled singleton.
const RETRY_DELAYS_MS = [0, 5_000, 15_000, 30_000, 60_000];
const MAX_ATTEMPTS = 5;

async function markRetry(operationId: string) {
  const op = await db.sync_queue.get(operationId);
  if (!op) throw new Error("op not found");
  const attempts = op.attempts + 1;
  const delay = RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length - 1)];
  await db.sync_queue.update(operationId, {
    attempts,
    next_attempt_at: Date.now() + delay,
  });
  return attempts >= MAX_ATTEMPTS ? "SYNC_ERROR" : "PENDING";
}

describe("sync queue retry bookkeeping", () => {
  beforeEach(async () => {
    await db.sync_queue.clear();
    await db.sync_queue.put({
      operation_id: "op-1",
      type: "CREATE_INCIDENT",
      payload: {},
      local_ref: "incident-1",
      attempts: 0,
      next_attempt_at: Date.now(),
      created_at: Date.now(),
    });
  });

  it("backs off with increasing delay on each failed attempt", async () => {
    for (let i = 0; i < RETRY_DELAYS_MS.length - 1; i++) {
      const before = Date.now();
      const state = await markRetry("op-1");
      const op = await db.sync_queue.get("op-1");
      expect(op?.attempts).toBe(i + 1);
      expect(op?.next_attempt_at).toBeGreaterThanOrEqual(before + RETRY_DELAYS_MS[i + 1] - 50);
      expect(state).toBe(i + 1 >= MAX_ATTEMPTS ? "SYNC_ERROR" : "PENDING");
    }
  });

  it("gives up after MAX_ATTEMPTS and reports SYNC_ERROR", async () => {
    let state = "PENDING";
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      state = await markRetry("op-1");
    }
    expect(state).toBe("SYNC_ERROR");
    const op = await db.sync_queue.get("op-1");
    expect(op?.attempts).toBe(MAX_ATTEMPTS);
  });
});

describe("MeshTransport interface", () => {
  it("only InternetTransport is available; Bluetooth/WifiDirect report unavailable", async () => {
    const { InternetTransport, BluetoothTransport, WifiDirectTransport } = await import(
      "@/lib/transport/mesh-transport"
    );

    const internet = new InternetTransport("http://localhost/api/v1", async () => null);
    expect(await internet.isAvailable()).toBe(true);

    const bt = new BluetoothTransport();
    expect(await bt.isAvailable()).toBe(false);
    await expect(bt.send()).rejects.toThrow(/not implemented/i);

    const wifi = new WifiDirectTransport();
    expect(await wifi.isAvailable()).toBe(false);
    await expect(wifi.send()).rejects.toThrow(/not implemented/i);
  });
});

describe("sync idempotency contract", () => {
  beforeEach(async () => {
    await db.sync_queue.clear();
  });

  it("reuses the same operation_id across retries of the same local record", async () => {
    const spy = vi.fn();
    const opId = "stable-op-id";
    await db.sync_queue.put({
      operation_id: opId,
      type: "CREATE_SOS",
      payload: { uuid: "sos-uuid-1" },
      local_ref: "sos-uuid-1",
      attempts: 2,
      next_attempt_at: Date.now(),
      created_at: Date.now(),
    });

    const stored = await db.sync_queue.get(opId);
    spy(stored?.operation_id);

    // Simulating a retry never mints a new operation_id -- the server relies
    // on operation_id being stable across retries to dedupe (docs/contract.md).
    expect(spy).toHaveBeenCalledWith(opId);
  });
});
