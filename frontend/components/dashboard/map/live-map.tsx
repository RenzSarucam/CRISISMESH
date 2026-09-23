"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { MarkerClusterGroup } from "@/components/dashboard/map/marker-cluster-group";
import { evacIcon, incidentIcon, resourceIcon, sosIcon } from "@/components/dashboard/map/map-icons";
import { MapFilterBar, type MapFilters } from "@/components/dashboard/map/map-filter-bar";
import { MapEntitySheet, type MapEntity } from "@/components/dashboard/map/map-entity-sheet";
import { useIncidentsForMap } from "@/hooks/use-incidents";
import { useSosRequests } from "@/hooks/use-sos";
import { useResources } from "@/hooks/use-resources";
import { useEvacuationCenters } from "@/hooks/use-evacuation-centers";
import { asItems } from "@/lib/api/as-items";
import { SEVERITY_COLOR } from "@/lib/chart-colors";

const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842]; // Manila — reasonable default; real deployments should center on their AOI

function sinceParam(preset?: string): string | undefined {
  if (!preset) return undefined;
  const now = Date.now();
  const ms = { "24h": 86_400_000, "7d": 7 * 86_400_000, "30d": 30 * 86_400_000 }[preset];
  return ms ? new Date(now - ms).toISOString() : undefined;
}

export default function LiveMap() {
  const [filters, setFilters] = useState<MapFilters>({
    severities: new Set(),
    showIncidents: true,
    showSos: true,
    showResources: true,
    showEvac: true,
  });
  const [entity, setEntity] = useState<MapEntity | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const incidentsQuery = useIncidentsForMap({
    type: filters.type,
    status: filters.status,
    verification_status: filters.verification,
    since: sinceParam(filters.since),
  });
  const sosQuery = useSosRequests({ status: "ACTIVE" });
  const resourcesQuery = useResources();
  const evacQuery = useEvacuationCenters();

  const incidents = (incidentsQuery.data?.items ?? []).filter(
    (i) => filters.severities.size === 0 || filters.severities.has(i.severity),
  );
  const sosRequests = asItems(sosQuery.data);
  const resources = asItems(resourcesQuery.data);
  const evacCenters = asItems(evacQuery.data);

  function open(e: MapEntity) {
    setEntity(e);
    setSheetOpen(true);
  }

  const incidentMarkers = useMemo(
    () =>
      filters.showIncidents
        ? incidents
            .filter((i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude))
            .map((i) => ({
              key: `incident-${i.id}`,
              position: [i.latitude, i.longitude] as [number, number],
              icon: incidentIcon(i.severity),
              onClick: () => open({ kind: "incident", data: i }),
            }))
        : [],
    [incidents, filters.showIncidents],
  );

  const sosMarkers = useMemo(
    () =>
      filters.showSos
        ? sosRequests
            .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
            .map((s) => ({
              key: `sos-${s.id}`,
              position: [s.latitude, s.longitude] as [number, number],
              icon: sosIcon(),
              onClick: () => open({ kind: "sos", data: s }),
            }))
        : [],
    [sosRequests, filters.showSos],
  );

  const resourceMarkers = useMemo(
    () =>
      filters.showResources
        ? resources
            .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
            .map((r) => ({
              key: `resource-${r.id}`,
              position: [r.latitude, r.longitude] as [number, number],
              icon: resourceIcon(),
              onClick: () => open({ kind: "resource", data: r }),
            }))
        : [],
    [resources, filters.showResources],
  );

  const evacMarkers = useMemo(
    () =>
      filters.showEvac
        ? evacCenters
            .filter((e) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude))
            .map((e) => ({
              key: `evac-${e.id}`,
              position: [e.latitude, e.longitude] as [number, number],
              icon: evacIcon(),
              onClick: () => open({ kind: "evac", data: e }),
            }))
        : [],
    [evacCenters, filters.showEvac],
  );

  const allMarkers = [...incidentMarkers, ...sosMarkers, ...resourceMarkers, ...evacMarkers];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <MapFilterBar filters={filters} onChange={setFilters} />
      <div className="relative flex-1">
        <MapContainer center={DEFAULT_CENTER} zoom={12} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup markers={allMarkers} />
        </MapContainer>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-md border bg-card/95 px-3 py-2 text-[0.65rem] shadow-sm">
          <p className="mb-1 font-medium text-muted-foreground">Severity</p>
          <div className="flex flex-col gap-1">
            {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full border border-white"
                  style={{ background: SEVERITY_COLOR[s] }}
                />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <MapEntitySheet entity={entity} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
