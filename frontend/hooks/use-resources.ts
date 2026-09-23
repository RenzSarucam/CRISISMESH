"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, Resource } from "@/types";

export function useResources() {
  return useQuery({
    queryKey: ["resources"],
    queryFn: () => api.get<Paginated<Resource> | Resource[]>("/resources"),
  });
}

export type ResourceInput = Omit<Resource, "id" | "uuid" | "last_updated_at" | "verified">;

function useInvalidateResources() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["resources"] });
}

export function useCreateResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: (input: ResourceInput) => api.post<Resource>("/resources", input),
    onSuccess: invalidate,
  });
}

export function useUpdateResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<ResourceInput> & { id: string }) =>
      api.put<Resource>(`/resources/${id}`, input),
    onSuccess: invalidate,
  });
}

/** DELETE /resources/{id} is not explicitly listed in docs/contract.md (only
 * POST/PUT are documented for resources) — called here as the conventional
 * Laravel resource-controller `destroy` route. Flagged as a contract gap. */
export function useDeleteResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.del<{ id: string }>(`/resources/${id}`),
    onSuccess: invalidate,
  });
}

/** No POST /resources/{id}/verify in docs/contract.md — modeled as PUT with
 * verified: true. Flagged as a contract gap. */
export function useVerifyResource() {
  const invalidate = useInvalidateResources();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.put<Resource>(`/resources/${id}`, { verified: true }),
    onSuccess: invalidate,
  });
}
