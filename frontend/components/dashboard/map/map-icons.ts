import L from "leaflet";
import { SEVERITY_COLOR } from "@/lib/chart-colors";
import type { Severity } from "@/types";

function dotIcon(color: string, size = 16, ring = false) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25);${
      ring ? "outline:2px solid rgba(0,0,0,0.15);" : ""
    }"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function incidentIcon(severity: Severity) {
  return dotIcon(SEVERITY_COLOR[severity] ?? "#898781", 16);
}

export function sosIcon() {
  return dotIcon("#d03b3b", 20, true);
}

export function evacIcon() {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;background:#2a78d6;color:white;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25);">E</span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function resourceIcon() {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;background:#1baf7a;color:white;font-size:10px;font-weight:700;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25);">R</span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
