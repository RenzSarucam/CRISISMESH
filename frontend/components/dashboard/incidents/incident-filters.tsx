"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { IncidentFilters } from "@/hooks/use-incidents";
import type { IncidentStatus, IncidentType, Severity, VerificationStatus } from "@/types";

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
const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES: IncidentStatus[] = ["REPORTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "DISMISSED"];
const VERIFICATIONS: VerificationStatus[] = [
  "UNVERIFIED",
  "COMMUNITY_CONFIRMED",
  "RESPONDER_VERIFIED",
  "ADMIN_VERIFIED",
  "FALSE_REPORT",
];

export function IncidentFilterBar({
  filters,
  onChange,
}: {
  filters: IncidentFilters;
  onChange: (filters: IncidentFilters) => void;
}) {
  const hasFilters = !!(filters.type || filters.severity || filters.status || filters.verification_status);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        placeholder="Type"
        value={filters.type}
        options={TYPES}
        onChange={(v) => onChange({ ...filters, type: v as IncidentType | undefined, page: 1 })}
      />
      <FilterSelect
        placeholder="Severity"
        value={filters.severity}
        options={SEVERITIES}
        onChange={(v) => onChange({ ...filters, severity: v as Severity | undefined, page: 1 })}
      />
      <FilterSelect
        placeholder="Status"
        value={filters.status}
        options={STATUSES}
        onChange={(v) => onChange({ ...filters, status: v as IncidentStatus | undefined, page: 1 })}
      />
      <FilterSelect
        placeholder="Verification"
        value={filters.verification_status}
        options={VERIFICATIONS}
        onChange={(v) =>
          onChange({ ...filters, verification_status: v as VerificationStatus | undefined, page: 1 })
        }
      />
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ page: 1 })}>
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}

function FilterSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value?: string;
  options: string[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? "ALL"}
      onValueChange={(v) => onChange(v === "ALL" ? undefined : v)}
    >
      <SelectTrigger className="h-8 w-[150px] text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All {placeholder.toLowerCase()}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt.replaceAll("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
