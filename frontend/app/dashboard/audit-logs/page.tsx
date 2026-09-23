"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { useSession } from "@/hooks/use-session";
import { useAuditLogs } from "@/hooks/use-audit-logs";

export default function AuditLogsPage() {
  const { user } = useSession();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAuditLogs({ page });

  if (user && user.role !== "admin") {
    return (
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>Admins only</AlertTitle>
        <AlertDescription>You need an admin account to view audit logs.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">A record of sensitive actions taken across the system.</p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t load audit logs</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Please try again shortly."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No audit log entries yet.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>IP address</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user_name ?? log.user_id ?? "System"}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        {log.entity}
                        {log.entity_id ? ` #${log.entity_id}` : ""}
                      </TableCell>
                      <TableCell>{log.ip_address ?? "—"}</TableCell>
                      <TableCell>{format(new Date(log.created_at), "PPp")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data && (
                <PaginationBar
                  page={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  total={data.meta.total}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
