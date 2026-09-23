"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./chart-card";
import { ChartTooltip } from "./chart-tooltip";
import { CATEGORICAL, CHART_INK } from "@/lib/chart-colors";
import type { DashboardStatistics } from "@/types";

const BINS = [
  { label: "0–5m", max: 5 },
  { label: "5–10m", max: 10 },
  { label: "10–15m", max: 15 },
  { label: "15–30m", max: 30 },
  { label: "30–60m", max: 60 },
  { label: "60m+", max: Infinity },
];

export function SosResponseTimeChart({
  data,
  loading,
}: {
  data?: DashboardStatistics["sos_response_time_minutes"];
  loading?: boolean;
}) {
  const minutes = (data ?? []).map((d) => d.minutes);
  const points = BINS.map((bin, i) => {
    const lowerBound = i === 0 ? -Infinity : BINS[i - 1].max;
    const count = minutes.filter((m) => m > lowerBound && m <= bin.max).length;
    return { label: bin.label, count };
  });

  return (
    <ChartCard
      title="SOS response time"
      description="Time from SOS creation to acknowledgment, in minutes"
      loading={loading}
      empty={minutes.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
          <XAxis
            dataKey="label"
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
          <Bar dataKey="count" name="SOS requests" fill={CATEGORICAL[1]} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
