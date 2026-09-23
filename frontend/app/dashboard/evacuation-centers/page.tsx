"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EvacStatusBadge } from "@/components/dashboard/badges";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { EvacFormDialog } from "@/components/dashboard/evacuation-centers/evac-form-dialog";
import { useDeleteEvacuationCenter, useEvacuationCenters } from "@/hooks/use-evacuation-centers";
import { asItems } from "@/lib/api/as-items";
import { ApiClientError } from "@/lib/api/client";
import type { EvacuationCenter } from "@/types";

export default function EvacuationCentersPage() {
  const { data, isLoading, isError, error } = useEvacuationCenters();
  const centers = asItems(data);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EvacuationCenter | null>(null);
  const [deleting, setDeleting] = useState<EvacuationCenter | null>(null);
  const del = useDeleteEvacuationCenter();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(center: EvacuationCenter) {
    setEditing(center);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await del.mutateAsync({ id: deleting.id });
      toast.success("Evacuation center deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not delete evacuation center.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Evacuation Centers</h1>
          <p className="text-sm text-muted-foreground">Capacity and status of every evacuation center.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New center
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t load evacuation centers</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Please try again shortly."}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All evacuation centers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : centers.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No evacuation centers yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[220px]">Occupancy</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centers.map((center) => {
                  const pct =
                    center.capacity > 0
                      ? Math.min(100, Math.round((center.current_occupancy / center.capacity) * 100))
                      : 0;
                  return (
                    <TableRow key={center.id}>
                      <TableCell className="font-medium">{center.name}</TableCell>
                      <TableCell>
                        <EvacStatusBadge status={center.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Progress value={pct} className="h-1.5" />
                          <span className="text-[0.65rem] text-muted-foreground">
                            {center.current_occupancy} / {center.capacity} ({pct}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{center.address}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(center)} aria-label="Edit">
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(center)}
                            aria-label="Delete"
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EvacFormDialog open={formOpen} onOpenChange={setFormOpen} center={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete evacuation center?"
        description={`This will remove "${deleting?.name}" from the list. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
