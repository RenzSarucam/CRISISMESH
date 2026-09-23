"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboardStatistics } from "@/hooks/use-dashboard-statistics";
import { IncidentsOverTimeChart } from "@/components/dashboard/analytics/incidents-over-time-chart";
import { IncidentsByTypeChart } from "@/components/dashboard/analytics/incidents-by-type-chart";
import { IncidentsBySeverityChart } from "@/components/dashboard/analytics/incidents-by-severity-chart";
import { VerificationBreakdownChart } from "@/components/dashboard/analytics/verification-breakdown-chart";
import { SosResponseTimeChart } from "@/components/dashboard/analytics/sos-response-time-chart";

export default function AnalyticsPage() {
  const { data, isLoading, isError, error } = useDashboardStatistics();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Trends and breakdowns from dashboard statistics.</p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t load analytics</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Please try again shortly."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IncidentsOverTimeChart data={data?.incidents_over_time} loading={isLoading} />
        <IncidentsBySeverityChart data={data?.incidents_by_severity} loading={isLoading} />
        <IncidentsByTypeChart data={data?.incidents_by_type} loading={isLoading} />
        <VerificationBreakdownChart data={data?.verification_breakdown} loading={isLoading} />
        <SosResponseTimeChart data={data?.sos_response_time_minutes} loading={isLoading} />
      </div>
    </div>
  );
}
