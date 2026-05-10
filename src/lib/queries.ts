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
  AskSession,
  AskSuggestion,
  Brief,
  Invoice,
  ListBriefsQuery,
  ListNotificationsQuery,
  ListPlansResponse,
  ListSessionsQuery,
  ListSuggestionsResponse,
  ListTopicsQuery,
  ListVaultQuery,
  Notification,
  PageResponse,
  PaymentMethod,
  Subscription,
  TagSummary,
  Topic,
  TopicId,
  TopicStats,
  UnreadCountResponse,
  UserPlan,
  UserPreferences,
  UserProfile,
  VaultItem,
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

// ---------------------------------------------------------------------------
// Vault
// ---------------------------------------------------------------------------

export function vaultQuery(q: ListVaultQuery = {}): Promise<PageResponse<VaultItem>> {
  return memo("vault.list", [q], () =>
    api.get<PageResponse<VaultItem>>("/vault", q as QueryParams),
  );
}

export function vaultTagsQuery(): Promise<{ tags: TagSummary[] }> {
  return memo("vault.tags", [], () =>
    api.get<{ tags: TagSummary[] }>("/vault/tags"),
  );
}

// ---------------------------------------------------------------------------
// Ask
// ---------------------------------------------------------------------------

export function askSessionsQuery(
  q: ListSessionsQuery = {},
): Promise<PageResponse<AskSession>> {
  return memo("ask.sessions", [q], () =>
    api.get<PageResponse<AskSession>>("/ask/sessions", q as QueryParams),
  );
}

export function askSuggestionsQuery(): Promise<ListSuggestionsResponse> {
  return memo("ask.suggestions", [], () =>
    api.get<ListSuggestionsResponse>("/ask/suggestions"),
  );
}

/** Federated free-text search — fans out to topics + briefs + vault. */
export interface FederatedSearchResult {
  topics: Topic[];
  briefs: Brief[];
  vault: VaultItem[];
  totals: { topics: number; briefs: number; vault: number };
}

export function federatedSearchQuery(q: string): Promise<FederatedSearchResult> {
  return memo("search.federated", [q], async () => {
    if (!q.trim()) {
      return {
        topics: [],
        briefs: [],
        vault: [],
        totals: { topics: 0, briefs: 0, vault: 0 },
      };
    }
    const [topicsR, briefsR, vaultR] = await Promise.allSettled([
      topicsQuery({ q, limit: 12 }),
      briefsQuery({ q, limit: 12 }),
      vaultQuery({ q, limit: 12 }),
    ]);
    const topics = topicsR.status === "fulfilled" ? topicsR.value : null;
    const briefs = briefsR.status === "fulfilled" ? briefsR.value : null;
    const vault = vaultR.status === "fulfilled" ? vaultR.value : null;
    return {
      topics: topics?.items ?? [],
      briefs: briefs?.items ?? [],
      vault: vault?.items ?? [],
      totals: {
        topics: topics?.totalEstimate ?? 0,
        briefs: briefs?.totalEstimate ?? 0,
        vault: vault?.totalEstimate ?? 0,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// User (profile / preferences / plan)
// ---------------------------------------------------------------------------

export function userMeQuery(): Promise<UserProfile> {
  return memo("user.me", [], () => api.get<UserProfile>("/user/me"));
}

export function userPreferencesQuery(): Promise<UserPreferences> {
  return memo("user.prefs", [], () =>
    api.get<UserPreferences>("/user/me/preferences"),
  );
}

export function userPlanQuery(): Promise<UserPlan> {
  return memo("user.plan", [], () => api.get<UserPlan>("/user/me/plan"));
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export function subscriptionQuery(): Promise<Subscription> {
  return memo("billing.sub", [], () =>
    api.get<Subscription>("/billing/subscription"),
  );
}

export function plansQuery(): Promise<ListPlansResponse> {
  return memo("billing.plans", [], () =>
    api.get<ListPlansResponse>("/billing/plans"),
  );
}

export function invoicesQuery(): Promise<PageResponse<Invoice>> {
  return memo("billing.invoices", [], () =>
    api.get<PageResponse<Invoice>>("/billing/invoices"),
  );
}

export function paymentMethodsQuery(): Promise<{ items: PaymentMethod[] }> {
  return memo("billing.pm", [], () =>
    api.get<{ items: PaymentMethod[] }>("/billing/payment-methods"),
  );
}
