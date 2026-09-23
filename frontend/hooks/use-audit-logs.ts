"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { AuditLog, Paginated } from "@/types";

export interface AuditLogFilters {
  page?: number;
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => api.get<Paginated<AuditLog>>("/audit-logs", { page: filters.page }),
  });
}
