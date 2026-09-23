"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useCachedResources, useCachedEvacuationCenters } from "@/hooks/use-cached-resources";
import { getCurrentPosition } from "@/lib/geolocation";

const DAVAO_CENTER: [number, number] = [7.0707, 125.6087];

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#dc2626",
};

function Recenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
}

export function FieldMap() {
  const { resources } = useCachedResources();
  const { centers } = useCachedEvacuationCenters();
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then((p) => setPosition([p.latitude, p.longitude]))
      .catch(() => setPosition(null));
  }, []);

  return (
    <MapContainer
      center={position ?? DAVAO_CENTER}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter position={position} />

      {position && (
        <CircleMarker center={position} radius={8} pathOptions={{ color: "#2563eb", fillOpacity: 0.6 }}>
          <Popup>You are here</Popup>
        </CircleMarker>
      )}

      {resources.map((r) => (
        <CircleMarker
          key={r.uuid}
          center={[r.latitude, r.longitude]}
          radius={7}
          pathOptions={{ color: "#0ea5e9", fillOpacity: 0.7 }}
        >
          <Popup>
            <p className="font-semibold">{r.name}</p>
            <p className="text-xs">{r.type} — {r.availability}</p>
          </Popup>
        </CircleMarker>
      ))}

      {centers.map((c) => (
        <CircleMarker
          key={c.uuid}
          center={[c.latitude, c.longitude]}
          radius={9}
          pathOptions={{ color: "#16a34a", fillOpacity: 0.7 }}
        >
          <Popup>
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs">
              {c.status} — {c.current_occupancy}/{c.capacity} occupied
            </p>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export { SEVERITY_COLOR };
