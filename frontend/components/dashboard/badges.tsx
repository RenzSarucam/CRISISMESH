import { Badge } from "@/components/ui/badge";
import type {
  Availability,
  EvacStatus,
  IncidentStatus,
  Role,
  Severity,
  SosStatus,
  SyncState,
  VerificationStatus,
} from "@/types";

// Literal arbitrary-value classes (Tailwind's scanner needs static strings,
// not template-interpolated ones) built from the reserved status palette.
const severityStyle: Record<Severity, string> = {
  LOW: "bg-[#0ca30c]/10 text-[#0ca30c] border-[#0ca30c]/30",
  MEDIUM: "bg-[#fab219]/10 text-[#8a5a00] border-[#fab219]/40 dark:text-[#fab219]",
  HIGH: "bg-[#ec835a]/10 text-[#ec835a] border-[#ec835a]/30",
  CRITICAL: "bg-[#d03b3b]/10 text-[#d03b3b] border-[#d03b3b]/30",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge variant="outline" className={severityStyle[severity]}>
      {severity}
    </Badge>
  );
}

const incidentStatusLabel: Record<IncidentStatus, string> = {
  REPORTED: "Reported",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

const incidentStatusVariant: Record<IncidentStatus, "default" | "secondary" | "outline"> = {
  REPORTED: "outline",
  ACKNOWLEDGED: "secondary",
  IN_PROGRESS: "default",
  RESOLVED: "secondary",
  DISMISSED: "outline",
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return <Badge variant={incidentStatusVariant[status]}>{incidentStatusLabel[status]}</Badge>;
}

const sosStatusLabel: Record<SosStatus, string> = {
  ACTIVE: "Active",
  ACKNOWLEDGED: "Acknowledged",
  RESPONDER_ASSIGNED: "Responder assigned",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};

const sosStatusVariant: Record<SosStatus, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  ACKNOWLEDGED: "secondary",
  RESPONDER_ASSIGNED: "secondary",
  RESOLVED: "outline",
  CANCELLED: "outline",
};

export function SosStatusBadge({ status }: { status: SosStatus }) {
  return <Badge variant={sosStatusVariant[status]}>{sosStatusLabel[status]}</Badge>;
}

const verificationLabel: Record<VerificationStatus, string> = {
  UNVERIFIED: "Unverified",
  COMMUNITY_CONFIRMED: "Community confirmed",
  RESPONDER_VERIFIED: "Responder verified",
  ADMIN_VERIFIED: "Admin verified",
  FALSE_REPORT: "False report",
};

const verificationVariant: Record<VerificationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  UNVERIFIED: "outline",
  COMMUNITY_CONFIRMED: "secondary",
  RESPONDER_VERIFIED: "default",
  ADMIN_VERIFIED: "default",
  FALSE_REPORT: "destructive",
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return <Badge variant={verificationVariant[status]}>{verificationLabel[status]}</Badge>;
}

const availabilityVariant: Record<Availability, "default" | "secondary" | "outline" | "destructive"> = {
  AVAILABLE: "default",
  LIMITED: "secondary",
  UNAVAILABLE: "destructive",
  UNKNOWN: "outline",
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  return <Badge variant={availabilityVariant[availability]}>{availability}</Badge>;
}

const evacStatusVariant: Record<EvacStatus, "default" | "secondary" | "outline" | "destructive"> = {
  OPEN: "default",
  FULL: "secondary",
  CLOSED: "destructive",
  UNKNOWN: "outline",
};

export function EvacStatusBadge({ status }: { status: EvacStatus }) {
  return <Badge variant={evacStatusVariant[status]}>{status}</Badge>;
}

const roleVariant: Record<Role, "default" | "secondary" | "outline"> = {
  citizen: "outline",
  responder: "secondary",
  admin: "default",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={roleVariant[role]}>{role}</Badge>;
}

const syncStateLabel: Record<SyncState, string> = {
  PENDING: "Pending sync",
  SYNCING: "Syncing",
  SYNCED: "Synced",
  SYNC_ERROR: "Sync error",
};

export function SyncStateBadge({ state }: { state: SyncState }) {
  return (
    <Badge variant={state === "SYNC_ERROR" ? "destructive" : "outline"}>
      {syncStateLabel[state]}
    </Badge>
  );
}
