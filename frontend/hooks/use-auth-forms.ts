"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { setSession } from "@/lib/offline/db";
import { setAuthToken } from "@/lib/api/client";
import type { Role, User } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: Extract<Role, "citizen" | "responder">;
}

/** Auth mutations for /login and /register. Kept separate from
 * lib/api/client's `loginRequest` helper so registration can share the same
 * "persist session on success" behavior without duplicating it. */
export function useLoginMutation() {
  return useMutation({
    mutationFn: async (input: LoginInput) =>
      api.post<{ user: User; token: string }>("/auth/login", input),
    onSuccess: async (data) => {
      setAuthToken(data.token);
      await setSession({ token: data.token, user: data.user });
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (input: RegisterInput) =>
      api.post<{ user: User; token: string }>("/auth/register", input),
    onSuccess: async (data) => {
      setAuthToken(data.token);
      await setSession({ token: data.token, user: data.user });
    },
  });
}
