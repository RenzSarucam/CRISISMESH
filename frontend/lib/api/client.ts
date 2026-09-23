import type { ApiResponse } from "@/types";
import { getSession, setSession, clearSession } from "@/lib/offline/db";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Token is cached in memory for the life of the tab; the durable copy lives
// in IndexedDB (lib/offline/db.ts), never in localStorage/sessionStorage,
// so a stolen XSS payload reading localStorage gets nothing.
let memoryToken: string | null = null;

export async function primeAuthFromStorage(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  const session = await getSession();
  memoryToken = session?.token ?? null;
  return memoryToken;
}

export function setAuthToken(token: string | null) {
  memoryToken = token;
}

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${API_URL}${path}`,
  );
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = await primeAuthFromStorage();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.params), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch {
    throw new ApiClientError("Network unreachable. This request will be retried when you're back online.", 0);
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (res.status === 401) {
    memoryToken = null;
    await clearSession();
  }

  if (!res.ok || !json || json.success === false) {
    const message = json && !json.success ? json.message : `Request failed (${res.status})`;
    const errors = json && !json.success ? json.errors : undefined;
    throw new ApiClientError(message, res.status, errors);
  }

  return (json as { data: T }).data;
}

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"]) =>
    apiFetch<T>(path, { method: "GET", params }),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PUT", body }),
  del: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

export async function loginRequest(email: string, password: string) {
  const data = await api.post<{ user: import("@/types").User; token: string }>(
    "/auth/login",
    { email, password },
  );
  memoryToken = data.token;
  await setSession({ token: data.token, user: data.user });
  return data;
}

export async function logoutRequest() {
  try {
    await api.post("/auth/logout");
  } finally {
    memoryToken = null;
    await clearSession();
  }
}
