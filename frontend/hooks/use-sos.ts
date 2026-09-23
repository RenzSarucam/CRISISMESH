"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, SosRequest, SosStatus } from "@/types";

export interface SosFilters {
  page?: number;
  status?: SosStatus;
}

export function useSosRequests(filters: SosFilters = {}) {
  return useQuery({
    queryKey: ["sos", filters],
    queryFn: () => api.get<Paginated<SosRequest>>("/sos", { page: filters.page, status: filters.status }),
    refetchInterval: 20_000,
  });
}

function useInvalidateSos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["sos"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "statistics"] });
  };
}

export function useAcknowledgeSos() {
  const invalidate = useInvalidateSos();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<SosRequest>(`/sos/${id}/acknowledge`, {}),
    onSuccess: invalidate,
  });
}

export function useAssignSos() {
  const invalidate = useInvalidateSos();
  return useMutation({
    mutationFn: ({ id, responder_id }: { id: string; responder_id: string }) =>
      api.post<SosRequest>(`/sos/${id}/assign`, { responder_id }),
    onSuccess: invalidate,
  });
}

export function useResolveSos() {
  const invalidate = useInvalidateSos();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<SosRequest>(`/sos/${id}/resolve`, {}),
    onSuccess: invalidate,
  });
}
