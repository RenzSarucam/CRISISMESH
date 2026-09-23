"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { DashboardStatistics } from "@/types";

/** GET /dashboard/statistics — responder/admin only. Powers the Overview
 * stat cards and every chart on /dashboard/analytics. */
export function useDashboardStatistics() {
  return useQuery({
    queryKey: ["dashboard", "statistics"],
    queryFn: () => api.get<DashboardStatistics>("/dashboard/statistics"),
    staleTime: 30_000,
  });
}
