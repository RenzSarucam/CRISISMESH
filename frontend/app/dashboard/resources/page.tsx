"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Plus, Pencil, Trash2, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AvailabilityBadge } from "@/components/dashboard/badges";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { ResourceFormDialog } from "@/components/dashboard/resources/resource-form-dialog";
import { useDeleteResource, useResources, useVerifyResource } from "@/hooks/use-resources";
import { asItems } from "@/lib/api/as-items";
import { ApiClientError } from "@/lib/api/client";
import type { Resource } from "@/types";

export default function ResourcesPage() {
  const { data, isLoading, isError, error } = useResources();
  const resources = asItems(data);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const del = useDeleteResource();
  const verify = useVerifyResource();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(resource: Resource) {
    setEditing(resource);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await del.mutateAsync({ id: deleting.id });
      toast.success("Resource deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not delete resource.");
    }
  }

  async function handleVerify(resource: Resource) {
    try {
      await verify.mutateAsync({ id: resource.id });
      toast.success("Resource verified");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Could not verify resource.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resources</h1>
          <p className="text-sm text-muted-foreground">Water, food, medical, and other aid resources.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New resource
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Couldn&apos;t load resources</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Please try again shortly."}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All resources</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No resources yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.type.replaceAll("_", " ")}</TableCell>
                    <TableCell>
                      <AvailabilityBadge availability={resource.availability} />
                    </TableCell>
                    <TableCell>{resource.quantity ?? "—"}</TableCell>
                    <TableCell>
                      {resource.verified ? (
                        <Badge variant="secondary">
                          <BadgeCheck className="size-3" /> Verified
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleVerify(resource)}>
                          Verify
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(resource)} aria-label="Edit">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(resource)}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ResourceFormDialog open={formOpen} onOpenChange={setFormOpen} resource={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete resource?"
        description={`This will remove "${deleting?.name}" from the resource list. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
