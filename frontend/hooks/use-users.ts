"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Paginated, Role, User } from "@/types";

export interface UserFilters {
  page?: number;
  role?: Role;
}

/** GET /users?role= — admin-only user directory (docs/contract.md). Also
 * backs /dashboard/users, /dashboard/responders, and the assign-responder
 * pickers on incidents/SOS. */
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => api.get<Paginated<User> | User[]>("/users", { page: filters.page, role: filters.role }),
  });
}

export function useResponders() {
  return useUsers({ role: "responder" });
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: Role;
  phone?: string;
  emergency_contact?: string;
}

/** POST /users — admin creates an account directly (no invite/email flow in
 * this MVP). Deliberately does NOT touch the current session/token: this is
 * the admin acting on someone else's behalf, not a login. */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => api.post<User>("/users", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
