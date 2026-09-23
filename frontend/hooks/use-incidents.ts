"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  Incident,
  IncidentType,
  Paginated,
  Severity,
  IncidentStatus,
  VerificationStatus,
} from "@/types";

export interface IncidentFilters {
  page?: number;
  type?: IncidentType;
  severity?: Severity;
  status?: IncidentStatus;
  verification_status?: VerificationStatus;
  since?: string;
  bbox?: string;
}

function paramsFromFilters(filters: IncidentFilters) {
  return {
    page: filters.page,
    type: filters.type,
    severity: filters.severity,
    status: filters.status,
    verification_status: filters.verification_status,
    since: filters.since,
    bbox: filters.bbox,
  };
}

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => api.get<Paginated<Incident>>("/incidents", paramsFromFilters(filters)),
  });
}

/** Unpaginated-ish pull for the live map: widest page size, no status filter
 * unless the caller supplies one via `filters`. */
export function useIncidentsForMap(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: ["incidents", "map", filters],
    queryFn: () => api.get<Paginated<Incident>>("/incidents", paramsFromFilters(filters)),
    refetchInterval: 30_000,
  });
}

export function useIncident(id: string | null) {
  return useQuery({
    queryKey: ["incidents", "detail", id],
    queryFn: () => api.get<Incident>(`/incidents/${id}`),
    enabled: !!id,
  });
}

function useInvalidateIncidents() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["incidents"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "statistics"] });
  };
}

export function useVerifyIncident() {
  const invalidate = useInvalidateIncidents();
  return useMutation({
    mutationFn: ({ id, verification_status }: { id: string; verification_status: VerificationStatus }) =>
      api.post<Incident>(`/incidents/${id}/verify`, { verification_status }),
    onSuccess: invalidate,
  });
}

export function useAssignIncident() {
  const invalidate = useInvalidateIncidents();
  return useMutation({
    mutationFn: ({ id, responder_id }: { id: string; responder_id: string }) =>
      api.post<Incident>(`/incidents/${id}/assign`, { responder_id }),
    onSuccess: invalidate,
  });
}

export function useResolveIncident() {
  const invalidate = useInvalidateIncidents();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<Incident>(`/incidents/${id}/resolve`, {}),
    onSuccess: invalidate,
  });
}

/** Dismiss isn't its own endpoint in docs/contract.md — the closest documented
 * primitive is PUT /incidents/{id} (responder/admin), used here to set
 * status: DISMISSED. Flagged as a contract gap in the build report. */
export function useDismissIncident() {
  const invalidate = useInvalidateIncidents();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.put<Incident>(`/incidents/${id}`, { status: "DISMISSED" satisfies IncidentStatus }),
    onSuccess: invalidate,
  });
}
