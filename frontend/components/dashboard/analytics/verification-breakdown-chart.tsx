"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./chart-card";
import { ChartTooltip } from "./chart-tooltip";
import { CATEGORICAL, CHART_INK } from "@/lib/chart-colors";
import type { DashboardStatistics } from "@/types";

const LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  COMMUNITY_CONFIRMED: "Community confirmed",
  RESPONDER_VERIFIED: "Responder verified",
  ADMIN_VERIFIED: "Admin verified",
  FALSE_REPORT: "False report",
};

export function VerificationBreakdownChart({
  data,
  loading,
}: {
  data?: DashboardStatistics["verification_breakdown"];
  loading?: boolean;
}) {
  const points = (data ?? []).map((d) => ({ status: LABELS[d.status] ?? d.status, count: d.count }));

  return (
    <ChartCard
      title="Verification status breakdown"
      description="Where reports stand in the verification pipeline"
      loading={loading}
      empty={points.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 24 }}>
          <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
          <XAxis
            dataKey="status"
            tick={{ fontSize: 10, fill: CHART_INK.muted }}
            axisLine={{ stroke: CHART_INK.axis }}
            tickLine={false}
            angle={-20}
            textAnchor="end"
            height={50}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: CHART_INK.muted }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={ChartTooltip} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="count" name="Reports" fill={CATEGORICAL[0]} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
