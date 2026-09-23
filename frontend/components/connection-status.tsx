"use client";

import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useConnectionState } from "@/hooks/use-connection-state";
import { syncManager } from "@/lib/offline/sync-manager";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CONFIG = {
  ONLINE: { label: "ONLINE", icon: Wifi, className: "text-green-600 bg-green-50 dark:bg-green-950" },
  OFFLINE: { label: "OFFLINE", icon: WifiOff, className: "text-red-600 bg-red-50 dark:bg-red-950" },
  SYNCING: { label: "SYNCING", icon: RefreshCw, className: "text-amber-600 bg-amber-50 dark:bg-amber-950" },
  SYNC_ERROR: { label: "SYNC ERROR", icon: AlertTriangle, className: "text-red-600 bg-red-50 dark:bg-red-950" },
} as const;

export function ConnectionBadge({ className }: { className?: string }) {
  const { state, pendingCount } = useConnectionState();
  const cfg = CONFIG[state];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        cfg.className,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className={cn("size-3.5", state === "SYNCING" && "animate-spin")} />
      {cfg.label}
      {pendingCount > 0 && state !== "SYNC_ERROR" && (
        <span className="opacity-75">({pendingCount} pending)</span>
      )}
    </div>
  );
}

/** Persistent offline banner used on field-app screens (spec section 15/38). */
export function OfflineBanner() {
  const { state, pendingCount } = useConnectionState();

  if (state === "ONLINE" && pendingCount === 0) return null;

  if (state === "SYNC_ERROR") {
    return (
      <div className="flex items-center justify-between gap-3 bg-red-600 px-4 py-2 text-sm text-white">
        <span className="flex items-center gap-2">
          <AlertTriangle className="size-4" />
          Some reports failed to sync after several attempts.
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 shrink-0"
          onClick={() => void syncManager.retryFailed()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (state === "OFFLINE") {
    return (
      <div className="flex items-center gap-2 bg-red-600 px-4 py-2 text-sm text-white">
        <WifiOff className="size-4 shrink-0" />
        <span>
          You&apos;re offline. New emergency reports will be stored securely on this
          device and synchronized when connection returns.
        </span>
      </div>
    );
  }

  if (state === "SYNCING") {
    return (
      <div className="flex items-center gap-2 bg-amber-500 px-4 py-2 text-sm text-white">
        <RefreshCw className="size-4 shrink-0 animate-spin" />
        Synchronizing {pendingCount} item{pendingCount === 1 ? "" : "s"}…
      </div>
    );
  }

  if (state === "ONLINE" && pendingCount > 0) {
    return (
      <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm text-white">
        <CheckCircle2 className="size-4 shrink-0" />
        {pendingCount} item{pendingCount === 1 ? "" : "s"} queued for sync…
      </div>
    );
  }

  return null;
}
