"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, Role, User } from "@/types";

export interface UserFilters {
  page?: number;
  role?: Role;
}

/** GET /users is NOT in docs/contract.md's endpoint list — the contract only
 * documents /auth/me for reading the current user. This hook assumes a
 * conventional admin-only listing endpoint (with an optional `role` filter)
 * because /dashboard/users, /dashboard/responders, and the incident/SOS
 * "assign responder" pickers all need one. Flagged as a contract gap: please
 * confirm the real path/shape with the backend before relying on this. */
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => api.get<Paginated<User> | User[]>("/users", { page: filters.page, role: filters.role }),
  });
}

export function useResponders() {
  return useUsers({ role: "responder" });
}
