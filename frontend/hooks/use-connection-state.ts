"use client";

import { useEffect, useState } from "react";
import { syncManager } from "@/lib/offline/sync-manager";
import { db } from "@/lib/offline/db";
import type { ConnectionState } from "@/types";

/** Single source of truth for the ONLINE/OFFLINE/SYNCING/SYNC_ERROR indicator
 * shown across the app. Never invents a "mesh connected" or "satellite"
 * state — only reflects what SyncManager actually knows. */
export function useConnectionState() {
  const [state, setState] = useState<ConnectionState>("OFFLINE");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setState);
    const interval = setInterval(async () => {
      const count = await db.sync_queue.count();
      setPendingCount(count);
    }, 3000);
    void db.sync_queue.count().then(setPendingCount);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { state, pendingCount };
}
