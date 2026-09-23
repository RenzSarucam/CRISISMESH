"use client";

import { useCallback, useRef, useState } from "react";
import { Siren, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConnectionBadge } from "@/components/connection-status";
import { getCurrentPosition } from "@/lib/geolocation";
import { createSosOffline } from "@/lib/offline/actions";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/offline/db";

const HOLD_MS = 2000;

type Phase = "idle" | "holding" | "confirm" | "sending" | "sent";

export default function SosPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [sentId, setSentId] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const lastSos = useLiveQuery(
    () => (sentId ? db.sos_requests.get(sentId) : undefined),
    [sentId],
  );

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setProgress(0);
    if (phase === "holding") setPhase("idle");
  }, [phase]);

  const startHold = useCallback(() => {
    setPhase("holding");
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / HOLD_MS);
      setProgress(pct);
      if (pct >= 1) {
        setPhase("confirm");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  async function sendSos() {
    setPhase("sending");
    try {
      const position = await getCurrentPosition().catch(() => null);
      const sos = await createSosOffline({
        latitude: position?.latitude ?? 0,
        longitude: position?.longitude ?? 0,
        message: message.trim() || null,
      });
      setSentId(sos.uuid);
      setPhase("sent");
    } catch {
      toast.error("Could not send SOS. It will be saved and retried automatically.");
      setPhase("idle");
    }
  }

  if (phase === "sent") {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8.5rem)] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <CheckCircle2 className="size-16 text-green-600" />
        <h1 className="text-2xl font-bold">SOS SENT</h1>
        <div className="w-full space-y-3 rounded-lg border bg-card p-4 text-left text-sm">
          <Row label="Location" value={lastSos?.latitude ? "Detected" : "Unavailable"} />
          <Row label="Network" value={lastSos?.network_status === "ONLINE" ? "Online" : "Offline"} />
          <Row
            label="Sync"
            value={
              lastSos?.syncState === "SYNCED"
                ? "Synced"
                : lastSos?.syncState === "SYNC_ERROR"
                  ? "Failed — retrying"
                  : "Pending"
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Your location has been shared with authorized responders.
        </p>
        <button
          className="mt-2 text-sm font-medium underline"
          onClick={() => {
            setPhase("idle");
            setSentId(null);
            setMessage("");
          }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-8.5rem)] max-w-md flex-col items-center justify-between gap-6 p-6">
      <div className="flex w-full justify-end">
        <ConnectionBadge />
      </div>

      {phase === "confirm" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <Siren className="size-16 animate-pulse text-red-600" />
          <h1 className="text-2xl font-bold">Confirm Emergency SOS?</h1>
          <p className="text-sm text-muted-foreground">
            This will alert emergency responders with your exact location. Only use this
            for a genuine emergency.
          </p>
          <div className="w-full space-y-2 text-left">
            <Label htmlFor="sos-message">Message (optional)</Label>
            <Textarea
              id="sos-message"
              placeholder="What's happening?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex w-full gap-3">
            <button
              className="flex-1 rounded-lg border py-3 font-medium"
              onClick={() => setPhase("idle")}
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-lg bg-red-600 py-3 font-bold text-white"
              onClick={sendSos}
            >
              SEND SOS
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-red-600">EMERGENCY</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Press and hold for {HOLD_MS / 1000} seconds to send SOS
            </p>
          </div>

          <button
            aria-label="Hold to send SOS"
            className="relative flex size-48 select-none items-center justify-center rounded-full bg-red-600 text-white shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-red-300 active:scale-95"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            disabled={phase === "sending"}
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
                strokeLinecap="round"
              />
            </svg>
            <span className="flex flex-col items-center gap-1">
              <Siren className="size-10" />
              <span className="text-sm font-bold">
                {phase === "sending" ? "SENDING…" : "HOLD"}
              </span>
            </span>
          </button>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            Your location will be shared with authorized responders.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
