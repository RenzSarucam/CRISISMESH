"use client";

import { AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResponders } from "@/hooks/use-users";
import { asItems } from "@/lib/api/as-items";
import { ApiClientError } from "@/lib/api/client";

const ONLINE_WINDOW_MS = 5 * 60_000;

function onlineStatus(lastActiveAt?: string | null): "Online" | "Offline" | "Unknown" {
  if (!lastActiveAt) return "Unknown";
  const diff = Date.now() - new Date(lastActiveAt).getTime();
  if (Number.isNaN(diff)) return "Unknown";
  return diff < ONLINE_WINDOW_MS ? "Online" : "Offline";
}

export default function RespondersPage() {
  const { data, isLoading, isError, error } = useResponders();
  const responders = asItems(data);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Responders</h1>
        <p className="text-sm text-muted-foreground">
          Status is derived from last activity — there is no separate &quot;busy&quot; state in the API, so
          this only ever shows Online, Offline, or Unknown.
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t load responders</AlertTitle>
          <AlertDescription>
            {error instanceof ApiClientError ? error.message : "Please try again shortly."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All responders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : responders.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No responders found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responders.map((responder) => {
                  const status = onlineStatus(responder.last_active_at);
                  return (
                    <TableRow key={responder.id}>
                      <TableCell className="font-medium">{responder.name}</TableCell>
                      <TableCell>{responder.email}</TableCell>
                      <TableCell>{responder.phone ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={status === "Online" ? "default" : status === "Offline" ? "outline" : "secondary"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {responder.last_active_at
                          ? formatDistanceToNow(new Date(responder.last_active_at), { addSuffix: true })
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
