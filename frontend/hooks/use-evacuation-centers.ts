"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { EvacuationCenter, Paginated } from "@/types";

export function useEvacuationCenters() {
  return useQuery({
    queryKey: ["evacuation-centers"],
    queryFn: () => api.get<Paginated<EvacuationCenter> | EvacuationCenter[]>("/evacuation-centers"),
  });
}

export type EvacuationCenterInput = Omit<EvacuationCenter, "id" | "uuid" | "updated_at" | "verified">;

function useInvalidateEvac() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["evacuation-centers"] });
}

export function useCreateEvacuationCenter() {
  const invalidate = useInvalidateEvac();
  return useMutation({
    mutationFn: (input: EvacuationCenterInput) => api.post<EvacuationCenter>("/evacuation-centers", input),
    onSuccess: invalidate,
  });
}

export function useUpdateEvacuationCenter() {
  const invalidate = useInvalidateEvac();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<EvacuationCenterInput> & { id: string }) =>
      api.put<EvacuationCenter>(`/evacuation-centers/${id}`, input),
    onSuccess: invalidate,
  });
}

/** DELETE /evacuation-centers/{id} is not documented in docs/contract.md
 * (only POST/PUT); called as the conventional resource-controller route.
 * Flagged as a contract gap. */
export function useDeleteEvacuationCenter() {
  const invalidate = useInvalidateEvac();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.del<{ id: string }>(`/evacuation-centers/${id}`),
    onSuccess: invalidate,
  });
}
