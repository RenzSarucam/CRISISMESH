"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/offline/db";
import { setAuthToken } from "@/lib/api/client";
import type { User } from "@/types";

/** Reads the session (token + user) from IndexedDB reactively via Dexie's
 * live query, and keeps the in-memory API client token in sync. */
export function useSession(): { user: User | null; loading: boolean } {
  // Wrap in { found } so "no session yet" is distinguishable from "still loading".
  const result = useLiveQuery(
    async () => ({ found: await db.session.get("current") }),
    [],
  );

  // Side effect on an external module (the API client's in-memory token),
  // not React state — safe to run synchronously here.
  useEffect(() => {
    if (result !== undefined) setAuthToken(result.found?.token ?? null);
  }, [result]);

  return { user: result?.found?.user ?? null, loading: result === undefined };
}
