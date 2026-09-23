"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { SystemStatus } from "@/types";

/** GET /system/status — public endpoint, polled every 30s for the top-bar
 * connection-state indicator. Reflects real API/DB health only; never
 * invents a mesh/Bluetooth/satellite state. */
export function useSystemStatus() {
  return useQuery({
    queryKey: ["system", "status"],
    queryFn: () => api.get<SystemStatus>("/system/status"),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

export type BrowserOnlineState = "online" | "offline";

/** This browser tab's own online/offline state (navigator.onLine), tracked
 * separately from the offline PWA sync-queue indicator in
 * hooks/use-connection-state.ts, which belongs to the field-app side. */
export function useBrowserOnline(): BrowserOnlineState {
  const [state, setState] = useState<BrowserOnlineState>(() =>
    typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "online",
  );

  useEffect(() => {
    const onOnline = () => setState("online");
    const onOffline = () => setState("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return state;
}
