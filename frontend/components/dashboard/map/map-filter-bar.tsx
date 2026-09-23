"use client";

import { Toggle } from "@/components/dashboard/map/toggle-chip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncidentStatus, IncidentType, Severity, VerificationStatus } from "@/types";

export interface MapFilters {
  severities: Set<Severity>;
  type?: IncidentType;
  status?: IncidentStatus;
  verification?: VerificationStatus;
  since?: string;
  showIncidents: boolean;
  showSos: boolean;
  showResources: boolean;
  showEvac: boolean;
}

const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TYPES: IncidentType[] = [
  "MEDICAL",
  "FIRE",
  "FLOOD",
  "LANDSLIDE",
  "ROAD_BLOCKAGE",
  "POWER_OUTAGE",
  "WATER_SHORTAGE",
  "MISSING_PERSON",
  "SECURITY",
  "EARTHQUAKE",
  "STORM",
  "OTHER",
];
const STATUSES: IncidentStatus[] = ["REPORTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "DISMISSED"];
const VERIFICATIONS: VerificationStatus[] = [
  "UNVERIFIED",
  "COMMUNITY_CONFIRMED",
  "RESPONDER_VERIFIED",
  "ADMIN_VERIFIED",
  "FALSE_REPORT",
];
const TIME_RANGES: { label: string; value: string | undefined }[] = [
  { label: "All time", value: undefined },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
];

export function MapFilterBar({
  filters,
  onChange,
}: {
  filters: MapFilters;
  onChange: (updater: (prev: MapFilters) => MapFilters) => void;
}) {
  function toggleSeverity(severity: Severity) {
    onChange((prev) => {
      const next = new Set(prev.severities);
      if (next.has(severity)) next.delete(severity);
      else next.add(severity);
      return { ...prev, severities: next };
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card p-2">
      <div className="flex items-center gap-1">
        {SEVERITIES.map((s) => (
          <Toggle key={s} pressed={filters.severities.has(s)} onPressedChange={() => toggleSeverity(s)}>
            {s}
          </Toggle>
        ))}
      </div>

      <Select
        value={filters.type ?? "ALL"}
        onValueChange={(v) => onChange((prev) => ({ ...prev, type: v === "ALL" ? undefined : (v as IncidentType) }))}
      >
        <SelectTrigger className="h-7 w-[130px] text-xs">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All types</SelectItem>
          {TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? "ALL"}
        onValueChange={(v) =>
          onChange((prev) => ({ ...prev, status: v === "ALL" ? undefined : (v as IncidentStatus) }))
        }
      >
        <SelectTrigger className="h-7 w-[130px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.verification ?? "ALL"}
        onValueChange={(v) =>
          onChange((prev) => ({ ...prev, verification: v === "ALL" ? undefined : (v as VerificationStatus) }))
        }
      >
        <SelectTrigger className="h-7 w-[150px] text-xs">
          <SelectValue placeholder="Verification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All verification</SelectItem>
          {VERIFICATIONS.map((v) => (
            <SelectItem key={v} value={v}>
              {v.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.since ?? "ALL"}
        onValueChange={(v) => onChange((prev) => ({ ...prev, since: v === "ALL" ? undefined : v }))}
      >
        <SelectTrigger className="h-7 w-[110px] text-xs">
          <SelectValue placeholder="Time range" />
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGES.map((r) => (
            <SelectItem key={r.label} value={r.value ?? "ALL"}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-1">
        <Toggle
          pressed={filters.showIncidents}
          onPressedChange={() => onChange((p) => ({ ...p, showIncidents: !p.showIncidents }))}
        >
          Incidents
        </Toggle>
        <Toggle pressed={filters.showSos} onPressedChange={() => onChange((p) => ({ ...p, showSos: !p.showSos }))}>
          SOS
        </Toggle>
        <Toggle
          pressed={filters.showResources}
          onPressedChange={() => onChange((p) => ({ ...p, showResources: !p.showResources }))}
        >
          Resources
        </Toggle>
        <Toggle pressed={filters.showEvac} onPressedChange={() => onChange((p) => ({ ...p, showEvac: !p.showEvac }))}>
          Evac centers
        </Toggle>
      </div>
    </div>
  );
}
