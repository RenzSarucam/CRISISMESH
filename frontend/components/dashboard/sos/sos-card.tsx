"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { BatteryLow, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeverityBadge, SosStatusBadge } from "@/components/dashboard/badges";
import { useAcknowledgeSos, useAssignSos, useResolveSos } from "@/hooks/use-sos";
import { useResponders } from "@/hooks/use-users";
import { asItems } from "@/lib/api/as-items";
import { ApiClientError } from "@/lib/api/client";
import type { SosRequest } from "@/types";

export function SosCard({ sos }: { sos: SosRequest }) {
  const [responderId, setResponderId] = useState("");
  const acknowledge = useAcknowledgeSos();
  const assign = useAssignSos();
  const resolve = useResolveSos();
  const { data: respondersData } = useResponders();
  const responders = asItems(respondersData);

  async function run(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Action failed. Please try again.");
    }
  }

  return (
    <Card className="border-l-4" style={{ borderLeftColor: sos.status === "ACTIVE" ? "#d03b3b" : undefined }}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <p className="text-sm font-semibold">{sos.user_name ?? "Unknown reporter"}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(sos.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SeverityBadge severity={sos.severity} />
          <SosStatusBadge status={sos.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-xs">
        {sos.message && <p className="text-sm">{sos.message}</p>}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="tabular-nums">
            {sos.latitude.toFixed(5)}, {sos.longitude.toFixed(5)}
          </span>
        </div>
        {sos.battery_percent != null && sos.battery_percent <= 20 && (
          <div className="flex items-center gap-1.5 text-[#8a5a00] dark:text-[#fab219]">
            <BatteryLow className="size-3.5" />
            Battery at {sos.battery_percent}%
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full gap-2">
          <Select value={responderId} onValueChange={setResponderId}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue placeholder="Assign responder" />
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
              run(() => assign.mutateAsync({ id: sos.id, responder_id: responderId }), "Responder assigned")
            }
          >
            {assign.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Assign"}
          </Button>
        </div>
        <div className="flex w-full gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={acknowledge.isPending || sos.status !== "ACTIVE"}
            onClick={() => run(() => acknowledge.mutateAsync({ id: sos.id }), "SOS acknowledged")}
          >
            {acknowledge.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Acknowledge"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={resolve.isPending || sos.status === "RESOLVED"}
            onClick={() => run(() => resolve.mutateAsync({ id: sos.id }), "SOS resolved")}
          >
            {resolve.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Resolve"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
