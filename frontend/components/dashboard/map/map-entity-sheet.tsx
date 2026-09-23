"use client";

import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  SeverityBadge,
  IncidentStatusBadge,
  VerificationBadge,
  SosStatusBadge,
  AvailabilityBadge,
  EvacStatusBadge,
} from "@/components/dashboard/badges";
import type { EvacuationCenter, Incident, Resource, SosRequest } from "@/types";

export type MapEntity =
  | { kind: "incident"; data: Incident }
  | { kind: "sos"; data: SosRequest }
  | { kind: "resource"; data: Resource }
  | { kind: "evac"; data: EvacuationCenter };

export function MapEntitySheet({
  entity,
  open,
  onOpenChange,
}: {
  entity: MapEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
        {entity?.kind === "incident" && <IncidentPanel incident={entity.data} />}
        {entity?.kind === "sos" && <SosPanel sos={entity.data} />}
        {entity?.kind === "resource" && <ResourcePanel resource={entity.data} />}
        {entity?.kind === "evac" && <EvacPanel evac={entity.data} />}
      </SheetContent>
    </Sheet>
  );
}

function IncidentPanel({ incident }: { incident: Incident }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{incident.title || incident.type.replaceAll("_", " ")}</SheetTitle>
        <SheetDescription>Incident · {incident.source.toLowerCase()}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-3 px-4 pb-4 text-xs">
        <div className="flex flex-wrap gap-1.5">
          <SeverityBadge severity={incident.severity} />
          <IncidentStatusBadge status={incident.status} />
          <VerificationBadge status={incident.verification_status} />
        </div>
        <p className="text-sm">{incident.description}</p>
        <Row label="Location" value={`${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`} />
        <Row label="Reported" value={format(new Date(incident.created_at), "PPp")} />
      </div>
    </>
  );
}

function SosPanel({ sos }: { sos: SosRequest }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>SOS request</SheetTitle>
        <SheetDescription>{sos.user_name ?? "Unknown reporter"}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-3 px-4 pb-4 text-xs">
        <div className="flex flex-wrap gap-1.5">
          <SeverityBadge severity={sos.severity} />
          <SosStatusBadge status={sos.status} />
        </div>
        {sos.message && <p className="text-sm">{sos.message}</p>}
        <Row label="Location" value={`${sos.latitude.toFixed(5)}, ${sos.longitude.toFixed(5)}`} />
        <Row label="Battery" value={sos.battery_percent != null ? `${sos.battery_percent}%` : "Unknown"} />
        <Row label="Network" value={sos.network_status} />
        <Row label="Sent" value={format(new Date(sos.created_at), "PPp")} />
      </div>
    </>
  );
}

function ResourcePanel({ resource }: { resource: Resource }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{resource.name}</SheetTitle>
        <SheetDescription>{resource.type.replaceAll("_", " ")}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-3 px-4 pb-4 text-xs">
        <AvailabilityBadge availability={resource.availability} />
        {resource.description && <p className="text-sm">{resource.description}</p>}
        <Row label="Quantity" value={resource.quantity != null ? String(resource.quantity) : "Unknown"} />
        <Row label="Hours" value={resource.operating_hours ?? "Not specified"} />
        <Row label="Location" value={`${resource.latitude.toFixed(5)}, ${resource.longitude.toFixed(5)}`} />
      </div>
    </>
  );
}

function EvacPanel({ evac }: { evac: EvacuationCenter }) {
  const pct = evac.capacity > 0 ? Math.min(100, Math.round((evac.current_occupancy / evac.capacity) * 100)) : 0;
  return (
    <>
      <SheetHeader>
        <SheetTitle>{evac.name}</SheetTitle>
        <SheetDescription>{evac.address}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-3 px-4 pb-4 text-xs">
        <EvacStatusBadge status={evac.status} />
        <Row label="Occupancy" value={`${evac.current_occupancy} / ${evac.capacity} (${pct}%)`} />
        <Row label="Facilities" value={evac.facilities.join(", ") || "None listed"} />
        <Row label="Location" value={`${evac.latitude.toFixed(5)}, ${evac.longitude.toFixed(5)}`} />
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
