"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { LogOut, FileText, Siren, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { db, clearSession } from "@/lib/offline/db";
import { logoutRequest } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { syncManager } from "@/lib/offline/sync-manager";
import { formatDistanceToNow } from "date-fns";

const SYNC_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  SYNCING: "outline",
  SYNCED: "default",
  SYNC_ERROR: "destructive",
};

export default function ProfilePage() {
  const { user } = useSession();
  const router = useRouter();

  const myIncidents = useLiveQuery(
    () => db.incidents.orderBy("created_at").reverse().toArray(),
    [],
  );
  const mySos = useLiveQuery(() => db.sos_requests.orderBy("created_at").reverse().toArray(), []);
  const queueSize = useLiveQuery(() => db.sync_queue.count(), []);

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      await clearSession();
    }
    router.replace("/login");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {user?.role}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="size-5" />
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <RefreshCw className="size-4" /> SYNC QUEUE
          </h2>
          {(queueSize ?? 0) > 0 && (
            <Button size="sm" variant="outline" onClick={() => void syncManager.drain()}>
              Sync now
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {queueSize ?? 0} operation{queueSize === 1 ? "" : "s"} waiting to sync.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <FileText className="size-4" /> MY REPORTS
        </h2>
        {(myIncidents ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        )}
        {(myIncidents ?? []).map((i) => (
          <Card key={i.uuid}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">
                  {i.type.replace(/_/g, " ")} · {formatDistanceToNow(new Date(i.created_at))} ago
                </p>
              </div>
              <Badge variant={SYNC_BADGE[i.syncState ?? "SYNCED"]}>
                {i.syncState ?? "SYNCED"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Siren className="size-4" /> MY SOS HISTORY
        </h2>
        {(mySos ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No SOS requests sent.</p>
        )}
        {(mySos ?? []).map((s) => (
          <Card key={s.uuid}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{s.status.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(s.created_at))} ago
                </p>
              </div>
              <Badge variant={SYNC_BADGE[s.syncState ?? "SYNCED"]}>
                {s.syncState ?? "SYNCED"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
