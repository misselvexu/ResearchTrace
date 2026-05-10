/**
 * Per-domain query helpers — thin wrappers over `api.*` that return cached
 * promises suitable for React 19's `use()` hook (Suspense-friendly).
 *
 * Why a tiny in-house cache instead of TanStack Query?
 *   - The prototype is mostly read-once, render-once. Cache invalidation is
 *     trivial (dev refresh wipes everything; mutations call `invalidate()`).
 *   - Avoids a top-level provider and adds zero runtime weight beyond a Map.
 *
 * Pattern in a Server / Client Component:
 *
 *   const briefs = use(briefsQuery({ topicId: t.id }));
 *
 * Pattern outside of render (e.g. in event handlers):
 *
 *   const created = await api.post<Topic, CreateTopicRequest>("/topics", body);
 *   invalidate(["topics"]);
 */

import type {
  Brief,
  ListBriefsQuery,
  ListNotificationsQuery,
  ListTopicsQuery,
  Notification,
  PageResponse,
  Topic,
  TopicId,
  TopicStats,
  UnreadCountResponse,
} from "@/types/api";
import { api, type QueryParams } from "./api";

// ---------------------------------------------------------------------------
// Promise cache — keyed by stable JSON of the query
// ---------------------------------------------------------------------------

type CacheEntry = { key: string; promise: Promise<unknown> };

const cache = new Map<string, CacheEntry>();

function stableKey(parts: readonly unknown[]): string {
  return parts
    .map((p) =>
      p === undefined
        ? ""
        : typeof p === "string"
          ? p
          : JSON.stringify(p, Object.keys(p as object).sort()),
    )
    .join("·");
}

function memo<T>(scope: string, parts: readonly unknown[], fn: () => Promise<T>): Promise<T> {
  const key = `${scope}::${stableKey(parts)}`;
  const hit = cache.get(key);
  if (hit) return hit.promise as Promise<T>;
  const promise = fn().catch((e) => {
    // Evict failed promise so subsequent calls retry.
    cache.delete(key);
    throw e;
  });
  cache.set(key, { key, promise });
  return promise;
}

/**
 * Invalidate all cached queries whose scope starts with one of the given
 * prefixes. Call this from mutation handlers after a successful POST/PATCH.
 *
 *   invalidate(["topics"]);          // topics list + by-id
 *   invalidate(["briefs", "topics"]); // multiple
 */
export function invalidate(scopes: readonly string[]): void {
  for (const [k] of cache) {
    if (scopes.some((s) => k.startsWith(`${s}::`))) {
      cache.delete(k);
    }
  }
}

/** Wipe everything (used by sign-out, locale switch, etc.). */
export function invalidateAll(): void {
  cache.clear();
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export function topicsQuery(q: ListTopicsQuery = {}): Promise<PageResponse<Topic>> {
  return memo("topics.list", [q], () =>
    api.get<PageResponse<Topic>>("/topics", q as QueryParams),
  );
}

export function topicQuery(id: TopicId | string): Promise<Topic> {
  return memo("topics.byId", [id], () => api.get<Topic>(`/topics/${id}`));
}

export function topicStatsQuery(id: TopicId | string): Promise<TopicStats> {
  return memo("topics.stats", [id], () => api.get<TopicStats>(`/topics/${id}/stats`));
}

// ---------------------------------------------------------------------------
// Briefs
// ---------------------------------------------------------------------------

export function briefsQuery(q: ListBriefsQuery = {}): Promise<PageResponse<Brief>> {
  return memo("briefs.list", [q], () =>
    api.get<PageResponse<Brief>>("/briefs", q as QueryParams),
  );
}

export function briefQuery(id: string): Promise<Brief> {
  return memo("briefs.byId", [id], () => api.get<Brief>(`/briefs/${id}`));
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function notificationsQuery(
  q: ListNotificationsQuery = {},
): Promise<PageResponse<Notification>> {
  return memo("notifications.list", [q], () =>
    api.get<PageResponse<Notification>>("/notifications", q as QueryParams),
  );
}

export function unreadCountQuery(): Promise<UnreadCountResponse> {
  return memo("notifications.unread", [], () =>
    api.get<UnreadCountResponse>("/notifications/unread-count"),
  );
}
