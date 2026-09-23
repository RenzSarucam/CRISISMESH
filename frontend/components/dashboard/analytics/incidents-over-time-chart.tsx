"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./chart-card";
import { ChartTooltip } from "./chart-tooltip";
import { CATEGORICAL, CHART_INK } from "@/lib/chart-colors";
import type { DashboardStatistics } from "@/types";

export function IncidentsOverTimeChart({
  data,
  loading,
}: {
  data?: DashboardStatistics["incidents_over_time"];
  loading?: boolean;
}) {
  const points = (data ?? []).map((d) => ({
    date: d.date,
    label: format(new Date(d.date), "MMM d"),
    count: d.count,
  }));

  return (
    <ChartCard title="Incidents over time" description="Daily incident volume" loading={loading} empty={points.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
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
          <Tooltip content={ChartTooltip} cursor={{ stroke: CHART_INK.axis }} />
          <Line
            type="monotone"
            dataKey="count"
            name="Incidents"
            stroke={CATEGORICAL[0]}
            strokeWidth={2}
            dot={{ r: 3, fill: CATEGORICAL[0] }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
