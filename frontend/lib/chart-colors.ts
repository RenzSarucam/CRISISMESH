// Validated categorical / status palette (see dataviz skill, references/palette.md).
// Fixed hue order — never cycle or reassign per-filter. Status colors are reserved
// and never reused as a categorical series color.

export const CATEGORICAL = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
] as const;

export const CATEGORICAL_DARK = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
] as const;

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const CHART_INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
};

export const SEVERITY_COLOR: Record<string, string> = {
  LOW: STATUS.good,
  MEDIUM: STATUS.warning,
  HIGH: STATUS.serious,
  CRITICAL: STATUS.critical,
};

// Fixed order for legends/series that key off IncidentType — assigned in
// declaration order from the categorical palette, capped at 8; overflow folds
// to a shared "muted" slot rather than generating a new hue.
export const INCIDENT_TYPE_ORDER = [
  "MEDICAL",
  "FIRE",
  "FLOOD",
  "LANDSLIDE",
  "ROAD_BLOCKAGE",
  "POWER_OUTAGE",
  "WATER_SHORTAGE",
  "MISSING_PERSON",
  "SECURITY",
  "EARTHQUAKE",
  "STORM",
  "OTHER",
] as const;

export function colorForType(type: string): string {
  const idx = INCIDENT_TYPE_ORDER.indexOf(type as (typeof INCIDENT_TYPE_ORDER)[number]);
  if (idx === -1 || idx >= CATEGORICAL.length) return CHART_INK.muted;
  return CATEGORICAL[idx];
}

export function colorForIndex(i: number): string {
  return CATEGORICAL[i % CATEGORICAL.length];
}
