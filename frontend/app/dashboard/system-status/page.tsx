"use client";

import { AlertTriangle, Server, Database, Clock, Users, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemStatus } from "@/hooks/use-system-status";
import { cn } from "@/lib/utils";

function statusTone(status: string) {
  if (status === "OPERATIONAL") return "bg-[#0ca30c]/10 text-[#0ca30c]";
  if (status === "DEGRADED") return "bg-[#fab219]/15 text-[#8a5a00] dark:text-[#fab219]";
  return "bg-[#d03b3b]/10 text-[#d03b3b]";
}

export default function SystemStatusPage() {
  const { data, isLoading, isError, error, dataUpdatedAt } = useSystemStatus();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">System Status</h1>
        <p className="text-sm text-muted-foreground">Live health of the CrisisMesh API and database.</p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t reach /system/status</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Please try again shortly."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Server className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">API</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={cn("text-xs", statusTone(data.api_status))} variant="outline">
                  {data.api_status}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Database className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">Database</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={cn("text-xs", statusTone(data.database_status))} variant="outline">
                  {data.database_status}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Users className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">Active users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{data.active_users}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <RefreshCw className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">Pending sync operations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{data.pending_sync_operations}</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Clock className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">Server time & version</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <p>App version: <span className="font-medium">{data.app_version}</span></p>
                <p>Server time: {format(new Date(data.server_time), "PPpp")}</p>
                <p>
                  Last synchronization:{" "}
                  {data.last_synchronization ? format(new Date(data.last_synchronization), "PPpp") : "Never"}
                </p>
                <p className="text-xs text-muted-foreground">
                  This page last refreshed {dataUpdatedAt ? format(new Date(dataUpdatedAt), "pp") : "—"} · polls
                  every 30s
                </p>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
