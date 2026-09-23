import type { QueuedOperation } from "@/lib/offline/db";

export interface SyncOperationResult {
  operation_id: string;
  success: boolean;
  entity_id?: string;
  error?: string;
}

/**
 * Abstraction over "how a queued operation physically reaches the server."
 * For this MVP, InternetTransport (a plain HTTPS POST to /sync) is the only
 * implementation. It exists so a future native app can add BluetoothTransport
 * or WifiDirectTransport (store-and-forward over a local mesh) without
 * touching SyncManager or any UI code — see docs/architecture.md #future-mesh.
 *
 * Do not claim any transport other than InternetTransport is active; there is
 * no Bluetooth/Wi-Fi Direct implementation in this codebase yet.
 */
export interface MeshTransport {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  send(deviceId: string, operations: QueuedOperation[]): Promise<SyncOperationResult[]>;
}

export class InternetTransport implements MeshTransport {
  readonly name = "internet";

  constructor(private apiUrl: string, private getToken: () => Promise<string | null>) {}

  async isAvailable(): Promise<boolean> {
    return typeof navigator === "undefined" ? true : navigator.onLine;
  }

  async send(deviceId: string, operations: QueuedOperation[]): Promise<SyncOperationResult[]> {
    const token = await this.getToken();
    const res = await fetch(`${this.apiUrl}/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        device_id: deviceId,
        operations: operations.map((op) => ({
          operation_id: op.operation_id,
          type: op.type,
          payload: op.payload,
        })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Sync request failed with status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message ?? "Sync failed");
    }
    return json.data.results as SyncOperationResult[];
  }
}

// Reserved for a future React Native mesh client. Intentionally unimplemented
// here — throwing keeps callers from silently pretending mesh delivery works.
export class BluetoothTransport implements MeshTransport {
  readonly name = "bluetooth";
  async isAvailable(): Promise<boolean> {
    return false;
  }
  async send(): Promise<SyncOperationResult[]> {
    throw new Error("BluetoothTransport is not implemented in this MVP.");
  }
}

export class WifiDirectTransport implements MeshTransport {
  readonly name = "wifi-direct";
  async isAvailable(): Promise<boolean> {
    return false;
  }
  async send(): Promise<SyncOperationResult[]> {
    throw new Error("WifiDirectTransport is not implemented in this MVP.");
  }
}
