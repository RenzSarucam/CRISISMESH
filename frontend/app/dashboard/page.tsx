"use client";

import {
  FileWarning,
  Siren,
  ShieldQuestion,
  ShieldCheck,
  Building2,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboardStatistics } from "@/hooks/use-dashboard-statistics";

export default function OverviewPage() {
  const { data, isLoading, isError, error } = useDashboardStatistics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Real-time snapshot of active incidents, SOS requests, and resource coverage.
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t load statistics</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Please try again shortly."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active incidents"
          value={data?.active_incidents ?? 0}
          icon={FileWarning}
          loading={isLoading}
          tone="warning"
        />
        <StatCard
          label="Active SOS"
          value={data?.active_sos ?? 0}
          icon={Siren}
          loading={isLoading}
          tone="critical"
        />
        <StatCard
          label="Unverified reports"
          value={data?.unverified_reports ?? 0}
          icon={ShieldQuestion}
          loading={isLoading}
        />
        <StatCard
          label="Responders online"
          value={data?.responders_online ?? 0}
          icon={ShieldCheck}
          loading={isLoading}
          tone="good"
        />
        <StatCard
          label="Evacuation capacity remaining"
          value={data?.evacuation_capacity_remaining ?? 0}
          icon={Building2}
          loading={isLoading}
        />
        <StatCard
          label="Offline devices"
          value={data?.offline_devices ?? 0}
          icon={WifiOff}
          loading={isLoading}
        />
        <StatCard
          label="Sync errors"
          value={data?.sync_errors ?? 0}
          icon={AlertTriangle}
          loading={isLoading}
          tone={data && data.sync_errors > 0 ? "critical" : "neutral"}
        />
      </div>
    </div>
  );
}
