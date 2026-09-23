"use client";

import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./chart-card";
import { ChartTooltip } from "./chart-tooltip";
import { CHART_INK, SEVERITY_COLOR } from "@/lib/chart-colors";
import type { DashboardStatistics } from "@/types";

const ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function IncidentsBySeverityChart({
  data,
  loading,
}: {
  data?: DashboardStatistics["incidents_by_severity"];
  loading?: boolean;
}) {
  const bySeverity = new Map<string, number>((data ?? []).map((d) => [d.severity, d.count]));
  const points = ORDER.map((severity) => ({ severity, count: bySeverity.get(severity) ?? 0 }));
  const hasData = (data ?? []).length > 0;

  return (
    <ChartCard
      title="Incidents by severity"
      description="Uses the reserved status palette (never reused for other series)"
      loading={loading}
      empty={!hasData}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
          <XAxis
            dataKey="severity"
            tick={{ fontSize: 11, fill: CHART_INK.muted }}
            axisLine={{ stroke: CHART_INK.axis }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: CHART_INK.muted }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={ChartTooltip} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {points.map((p) => (
              <Cell key={p.severity} fill={SEVERITY_COLOR[p.severity]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
