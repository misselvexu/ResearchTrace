/**
 * Sources Domain — external data source management.
 *
 * Endpoints (see openapi/paths/sources.yaml):
 *   GET    /sources                       (list, paginated)
 *   POST   /sources                       (connect a new source)
 *   GET    /sources/{id}
 *   PATCH  /sources/{id}                  (update config / credentials)
 *   DELETE /sources/{id}                  (disconnect)
 *   POST   /sources/{id}/test             (probe connectivity)
 *   POST   /sources/{id}/sync             (force re-ingest)
 *   GET    /sources/catalog               (available connectors directory)
 *   GET    /sources/{id}/health           (last sync status / errors)
 */

import type {
  AuditFields,
  LocalizedText,
  PageQuery,
  SortDirection,
  SourceId,
  UserId,
} from "./_shared";

// ============================================================================
// Source kinds — extensible enum; new connectors add cases here.
// ============================================================================

export type SourceKind =
  | "arxiv"
  | "rss"
  | "github"
  | "openreview"
  | "semantic_scholar"
  | "pubmed"
  | "biorxiv"
  | "hackernews"
  | "twitter"
  | "youtube"
  | "podcast"
  | "newsletter"
  | "custom_webhook";

export type SourceStatus = "connected" | "disconnected" | "error" | "rate_limited";

// ============================================================================
// Source entity
// ============================================================================

export interface Source extends AuditFields {
  id: SourceId;
  ownerId: UserId;
  kind: SourceKind;
  /** User-assigned label (bilingual). */
  name: LocalizedText;
  /** Connector-specific config (URL, query, channel, etc.). Shape depends on `kind`. */
  config: SourceConfig;
  status: SourceStatus;
  /** Last successful sync timestamp; null = never synced. */
  lastSyncedAt: string | null;
  /** Number of items ingested in last 30 days (denormalized). */
  recentItemCount: number;
  /** Last error message, if status === "error". */
  lastError: LocalizedText | null;
  /** Whether ingestion is currently active. */
  enabled: boolean;
}

/**
 * SourceConfig — discriminated by parent `Source.kind`.
 * Backend validates per-kind via JSON schema.
 */
export type SourceConfig =
  | { kind: "arxiv"; categories: string[]; query?: string }
  | { kind: "rss"; feedUrl: string }
  | { kind: "github"; repo: string; events: ("releases" | "issues" | "discussions")[] }
  | { kind: "openreview"; venueId: string }
  | { kind: "semantic_scholar"; query: string }
  | { kind: "pubmed"; query: string }
  | { kind: "biorxiv"; subject: string }
  | { kind: "hackernews"; minScore: number; query?: string }
  | { kind: "twitter"; handles: string[]; keywords?: string[] }
  | { kind: "youtube"; channelIds: string[] }
  | { kind: "podcast"; feedUrl: string }
  | { kind: "newsletter"; email: string }
  | { kind: "custom_webhook"; webhookUrl: string; secret?: string };

// ============================================================================
// List query
// ============================================================================

export type SourceSort = "recent" | "alphabetical" | "activity";

export interface ListSourcesQuery extends PageQuery {
  sort?: SourceSort;
  direction?: SortDirection;
  q?: string;
  kind?: SourceKind;
  status?: SourceStatus;
  enabled?: boolean;
}

// ============================================================================
// Mutations
// ============================================================================

export interface CreateSourceRequest {
  kind: SourceKind;
  name: LocalizedText;
  config: SourceConfig;
  enabled?: boolean;
}

export interface UpdateSourceRequest {
  name?: LocalizedText;
  config?: SourceConfig;
  enabled?: boolean;
}

// ============================================================================
// Connectivity test
// ============================================================================

export interface TestSourceResponse {
  ok: boolean;
  /** Round-trip latency in ms. */
  latencyMs: number;
  /** Sample item count discovered (e.g. "found 42 entries in feed"). */
  sampleCount: number;
  /** Bilingual error description if !ok. */
  error: LocalizedText | null;
}

// ============================================================================
// Force re-sync
// ============================================================================

export interface SyncSourceResponse {
  /** Job ID; client polls /sources/{id}/health for completion. */
  jobId: string;
  startedAt: string;
}

// ============================================================================
// Health
// ============================================================================

export interface SourceHealth {
  sourceId: SourceId;
  status: SourceStatus;
  lastSyncedAt: string | null;
  lastSyncDurationMs: number | null;
  /** Items ingested in last sync. */
  lastSyncCount: number;
  /** Recent error history (max 10). */
  recentErrors: {
    at: string;
    message: LocalizedText;
  }[];
}

// ============================================================================
// Catalog — available connectors (used by Sources page "Add" wizard)
// ============================================================================

export interface CatalogEntry {
  kind: SourceKind;
  name: LocalizedText;
  description: LocalizedText;
  /** Icon URL (CDN). */
  iconUrl: string;
  /** Whether this connector requires OAuth (true) or just config (false). */
  requiresOAuth: boolean;
  /** Whether this connector is currently in beta. */
  beta: boolean;
  /** Documentation URL. */
  docsUrl: string;
}

export interface CatalogResponse {
  entries: CatalogEntry[];
}
