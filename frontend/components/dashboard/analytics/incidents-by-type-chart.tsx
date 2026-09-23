"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./chart-card";
import { ChartTooltip } from "./chart-tooltip";
import { CATEGORICAL, CHART_INK } from "@/lib/chart-colors";
import type { DashboardStatistics } from "@/types";

export function IncidentsByTypeChart({
  data,
  loading,
}: {
  data?: DashboardStatistics["incidents_by_type"];
  loading?: boolean;
}) {
  const points = [...(data ?? [])]
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ type: d.type.replaceAll("_", " "), count: d.count }));

  return (
    <ChartCard
      title="Incidents by type"
      description="Report volume per incident type"
      loading={loading}
      empty={points.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={CHART_INK.grid} horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: CHART_INK.muted }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="type"
            type="category"
            width={110}
            tick={{ fontSize: 10, fill: CHART_INK.muted }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={ChartTooltip} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="count" name="Incidents" fill={CATEGORICAL[0]} radius={[0, 4, 4, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
