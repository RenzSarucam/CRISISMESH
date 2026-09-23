"use client";

import { useEffect } from "react";
import { syncManager } from "@/lib/offline/sync-manager";

/** Registers the PWA service worker (spec section 39) and kicks the sync
 * queue once on load in case operations were queued during a previous
 * offline session. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal: app still works without the service worker, just
        // without offline app-shell caching.
      });
    }
    if (navigator.onLine) void syncManager.drain();
  }, []);

  return null;
}
