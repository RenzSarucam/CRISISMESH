"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Leaflet touches `window` at import time, so it can only run client-side.
const LiveMap = dynamic(() => import("@/components/dashboard/map/live-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function MapPage() {
  return (
    <div className="flex h-[calc(100svh-8rem)] flex-col gap-3 md:h-[calc(100svh-6.5rem)]">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Live Map</h1>
        <p className="text-sm text-muted-foreground">
          Incidents, SOS requests, resources, and evacuation centers in one view.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <LiveMap />
      </div>
    </div>
  );
}
