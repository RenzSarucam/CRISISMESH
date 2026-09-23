"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  SeverityBadge,
  IncidentStatusBadge,
  VerificationBadge,
} from "@/components/dashboard/badges";
import {
  useAssignIncident,
  useDismissIncident,
  useResolveIncident,
  useVerifyIncident,
} from "@/hooks/use-incidents";
import { useResponders } from "@/hooks/use-users";
import { asItems } from "@/lib/api/as-items";
import { ApiClientError } from "@/lib/api/client";
import type { AiSuggestion, Incident, VerificationStatus } from "@/types";

// The contract's Incident type has no AI-suggestion field today. If/when the
// backend adds one, it will show up as an extra property on the JSON payload
// — this reads it defensively so the badge only renders when real data is
// present, never a fabricated verdict.
type IncidentWithMaybeSuggestion = Incident & { ai_suggestion?: AiSuggestion | null };

const VERIFICATION_OPTIONS: VerificationStatus[] = [
  "UNVERIFIED",
  "COMMUNITY_CONFIRMED",
  "RESPONDER_VERIFIED",
  "ADMIN_VERIFIED",
  "FALSE_REPORT",
];

export function IncidentDetailSheet({
  incident,
  open,
  onOpenChange,
}: {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [verification, setVerification] = useState<VerificationStatus | "">("");
  const [responderId, setResponderId] = useState<string>("");

  const verify = useVerifyIncident();
  const assign = useAssignIncident();
  const resolve = useResolveIncident();
  const dismiss = useDismissIncident();
  const { data: respondersData } = useResponders();
  const responders = asItems(respondersData);

  if (!incident) return null;
  const withSuggestion = incident as IncidentWithMaybeSuggestion;

  async function run(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Action failed. Please try again.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{incident.title || incident.type.replaceAll("_", " ")}</SheetTitle>
          <SheetDescription>Incident #{incident.id}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-wrap gap-1.5">
            <SeverityBadge severity={incident.severity} />
            <IncidentStatusBadge status={incident.status} />
            <VerificationBadge status={incident.verification_status} />
            {incident.created_offline && <Badge variant="outline">Captured offline</Badge>}
          </div>

          {withSuggestion.ai_suggestion && (
            <div className="flex items-start gap-2 rounded-md border border-dashed p-3 text-xs">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">AI-assisted suggestion — requires human verification</p>
                <p className="text-muted-foreground">{withSuggestion.ai_suggestion.summary}</p>
              </div>
            </div>
          )}

          <p className="text-sm">{incident.description}</p>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <dt className="text-muted-foreground">Location</dt>
            <dd className="tabular-nums">
              {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
              {incident.location_accuracy != null && ` (±${Math.round(incident.location_accuracy)}m)`}
            </dd>
            <dt className="text-muted-foreground">Source</dt>
            <dd className="capitalize">{incident.source.toLowerCase()}</dd>
            <dt className="text-muted-foreground">Reported by</dt>
            <dd>{incident.reporter_name ?? "Unknown"}</dd>
            <dt className="text-muted-foreground">Reported at</dt>
            <dd>{format(new Date(incident.created_at), "PPp")}</dd>
            {typeof incident.confirmations_count === "number" && (
              <>
                <dt className="text-muted-foreground">Confirmations</dt>
                <dd>{incident.confirmations_count}</dd>
              </>
            )}
            {incident.verified_by && (
              <>
                <dt className="text-muted-foreground">Verified by</dt>
                <dd>
                  {incident.verified_by}
                  {incident.verified_at && ` · ${format(new Date(incident.verified_at), "PPp")}`}
                </dd>
              </>
            )}
            {incident.possible_duplicates && incident.possible_duplicates.length > 0 && (
              <>
                <dt className="text-muted-foreground">Possible duplicates</dt>
                <dd>{incident.possible_duplicates.length}</dd>
              </>
            )}
          </dl>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium">Verify</p>
            <div className="flex gap-2">
              <Select value={verification} onValueChange={(v) => setVerification(v as VerificationStatus)}>
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue placeholder="Verification status" />
                </SelectTrigger>
                <SelectContent>
                  {VERIFICATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!verification || verify.isPending}
                onClick={() =>
                  verification &&
                  run(
                    () => verify.mutateAsync({ id: incident.id, verification_status: verification }),
                    "Verification updated",
                  )
                }
              >
                {verify.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Apply"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium">Assign responder</p>
            <div className="flex gap-2">
              <Select value={responderId} onValueChange={setResponderId}>
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue placeholder="Select responder" />
                </SelectTrigger>
                <SelectContent>
                  {responders.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!responderId || assign.isPending}
                onClick={() =>
                  responderId &&
                  run(
                    () => assign.mutateAsync({ id: incident.id, responder_id: responderId }),
                    "Responder assigned",
                  )
                }
              >
                {assign.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Assign"}
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={resolve.isPending || incident.status === "RESOLVED"}
            onClick={() => run(() => resolve.mutateAsync({ id: incident.id }), "Incident resolved")}
          >
            {resolve.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Resolve"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={dismiss.isPending || incident.status === "DISMISSED"}
            onClick={() => run(() => dismiss.mutateAsync({ id: incident.id }), "Incident dismissed")}
          >
            {dismiss.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Dismiss"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
