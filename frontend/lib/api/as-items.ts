import type { Paginated } from "@/types";

/** A few list endpoints in docs/contract.md (resources, evacuation-centers,
 * users) don't specify whether the response is a bare array or the standard
 * `{ items, meta }` pagination envelope used elsewhere. This normalizes
 * either shape so the UI doesn't crash once the backend lands. */
export function asItems<T>(data: Paginated<T> | T[] | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items;
}
