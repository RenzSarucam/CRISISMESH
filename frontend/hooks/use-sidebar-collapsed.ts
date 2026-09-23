"use client";

import { useState } from "react";

const STORAGE_KEY = "crisismesh:sidebar-collapsed";

function readStoredPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Per-viewer convenience only (which layout they last chose) — never
 * anything that needs to sync across devices or be read back by the app. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(readStoredPreference);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore (private browsing, blocked storage, etc.)
      }
      return next;
    });
  }

  return { collapsed, toggle };
}
