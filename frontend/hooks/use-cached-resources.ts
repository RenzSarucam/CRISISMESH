"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { db } from "@/lib/offline/db";
import type { Resource, EvacuationCenter, Paginated } from "@/types";

/**
 * Fetches resources/evacuation centers from the API when online and caches
 * them to IndexedDB; falls back to the cache when offline (spec section 38 —
 * citizens must still see previously cached resources/evac centers offline).
 */
export function useCachedResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [source, setSource] = useState<"live" | "cached">("cached");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await api.get<Paginated<Resource>>("/resources");
        if (cancelled) return;
        setResources(page.items);
        setSource("live");
        await db.resources_cache.bulkPut(page.items);
      } catch {
        const cached = await db.resources_cache.toArray();
        if (!cancelled) {
          setResources(cached);
          setSource("cached");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { resources, source };
}

export function useCachedEvacuationCenters() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [source, setSource] = useState<"live" | "cached">("cached");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await api.get<Paginated<EvacuationCenter>>("/evacuation-centers");
        if (cancelled) return;
        setCenters(page.items);
        setSource("live");
        await db.evac_cache.bulkPut(page.items);
      } catch {
        const cached = await db.evac_cache.toArray();
        if (!cancelled) {
          setCenters(cached);
          setSource("cached");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { centers, source };
}

function toRad(v: number) {
  return (v * Math.PI) / 180;
}

/** Haversine distance in meters — used for "nearby" sorting on the home screen. */
export function distanceMeters(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
