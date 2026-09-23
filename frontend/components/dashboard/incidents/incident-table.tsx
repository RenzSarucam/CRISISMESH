import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SeverityBadge, IncidentStatusBadge, VerificationBadge } from "@/components/dashboard/badges";
import type { Incident } from "@/types";

export function IncidentTable({
  incidents,
  loading,
  onSelect,
}: {
  incidents: Incident[];
  loading: boolean;
  onSelect: (incident: Incident) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        No incidents match these filters.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verification</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Reported</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell className="font-medium">
              {incident.title || incident.type.replaceAll("_", " ")}
              <div className="text-[0.65rem] text-muted-foreground">{incident.type.replaceAll("_", " ")}</div>
            </TableCell>
            <TableCell>
              <SeverityBadge severity={incident.severity} />
            </TableCell>
            <TableCell>
              <IncidentStatusBadge status={incident.status} />
            </TableCell>
            <TableCell>
              <VerificationBadge status={incident.verification_status} />
            </TableCell>
            <TableCell className="tabular-nums">
              {incident.latitude.toFixed(3)}, {incident.longitude.toFixed(3)}
            </TableCell>
            <TableCell className="capitalize">{incident.source.toLowerCase()}</TableCell>
            <TableCell title={incident.created_at}>
              {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" onClick={() => onSelect(incident)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
