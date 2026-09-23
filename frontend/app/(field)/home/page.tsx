"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Siren, FilePlus2, MapPin, Map as MapIcon, Droplets, HeartPulse, Home as HomeIcon } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { ConnectionBadge } from "@/components/connection-status";
import { Card, CardContent } from "@/components/ui/card";
import { useCachedResources, distanceMeters } from "@/hooks/use-cached-resources";
import { getCurrentPosition } from "@/lib/geolocation";

const RESOURCE_ICON: Record<string, typeof Droplets> = {
  WATER: Droplets,
  MEDICAL: HeartPulse,
  SHELTER: HomeIcon,
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function FieldHomePage() {
  const { user } = useSession();
  const { resources } = useCachedResources();
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then((pos) => setPosition([pos.latitude, pos.longitude]))
      .catch(() => setPosition(null));
  }, []);

  const nearby = position
    ? [...resources]
        .sort(
          (a, b) =>
            distanceMeters(position, [a.latitude, a.longitude]) -
            distanceMeters(position, [b.latitude, b.longitude]),
        )
        .slice(0, 5)
    : resources.slice(0, 5);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <h1 className="text-lg font-semibold">{user?.name ?? "Citizen"}</h1>
        </div>
        <ConnectionBadge />
      </header>

      <section aria-label="Quick actions" className="grid grid-cols-2 gap-3">
        <Link href="/sos">
          <Card className="border-red-200 bg-red-50 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900">
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <Siren className="size-8 text-red-600" />
              <span className="font-semibold text-red-700 dark:text-red-400">SOS</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/report">
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <FilePlus2 className="size-8" />
              <span className="font-semibold">Report Incident</span>
            </CardContent>
          </Card>
        </Link>
        <Card
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => getCurrentPosition().then((p) => setPosition([p.latitude, p.longitude]))}
        >
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <MapPin className="size-8" />
            <span className="font-semibold">My Location</span>
          </CardContent>
        </Card>
        <Link href="/map">
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <MapIcon className="size-8" />
              <span className="font-semibold">Map</span>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section aria-label="Nearby resources" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">NEARBY</h2>
        {nearby.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No cached resources yet. Connect once to load nearby resources for offline use.
          </p>
        )}
        {nearby.map((r) => {
          const Icon = RESOURCE_ICON[r.type] ?? MapPin;
          const dist = position ? distanceMeters(position, [r.latitude, r.longitude]) : null;
          return (
            <Card key={r.uuid}>
              <CardContent className="flex items-center gap-3 py-3">
                <Icon className="size-5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.availability}</p>
                </div>
                {dist !== null && (
                  <span className="text-xs text-muted-foreground">
                    {dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`}
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
