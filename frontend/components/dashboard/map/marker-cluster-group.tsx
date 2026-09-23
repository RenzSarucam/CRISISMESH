"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";

/** Thin imperative wrapper around leaflet.markercluster — there is no
 * official react-leaflet binding for it, so this drives an
 * L.markerClusterGroup layer directly from a list of markers, re-syncing
 * whenever `markers` changes. */
export function MarkerClusterGroup({
  markers,
}: {
  markers: { key: string; position: [number, number]; icon: L.DivIcon; onClick: () => void }[];
}) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const group = L.markerClusterGroup({ maxClusterRadius: 50 });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    for (const m of markers) {
      const marker = L.marker(m.position, { icon: m.icon });
      marker.on("click", m.onClick);
      group.addLayer(marker);
    }
  }, [markers]);

  return null;
}
