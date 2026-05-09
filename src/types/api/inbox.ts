/**
 * Inbox Domain — incoming items requiring triage.
 *
 * The Inbox is a unified stream of newly-ingested items across all of the
 * user's connected sources and subscribed topics. Users triage by:
 *   - reading (sets read=true)
 *   - saving to Vault
 *   - dismissing (archives)
 *   - starring
 *
 * Endpoints (see openapi/paths/inbox.yaml):
 *   GET    /inbox                            (list, paginated, filterable)
 *   GET    /inbox/{id}
 *   POST   /inbox/{id}/read
 *   POST   /inbox/{id}/unread
 *   POST   /inbox/{id}/star
 *   POST   /inbox/{id}/unstar
 *   POST   /inbox/{id}/dismiss               (archive without saving)
 *   POST   /inbox/{id}/save                  (forward to Vault)
 *   POST   /inbox/bulk                       (batch read/dismiss/save)
 *   GET    /inbox/counters                   (unread/starred badges)
 */

import type {
  DocumentRef,
  InboxItemId,
  LocalizedText,
  PageQuery,
  SortDirection,
  SourceId,
  TopicId,
  UserId,
} from "./_shared";

// ============================================================================
// Inbox item — discriminated union by `kind`
// ============================================================================

export type InboxItemKind = "paper" | "discussion" | "release" | "note" | "alert";

export interface InboxItemBase {
  id: InboxItemId;
  ownerId: UserId;
  kind: InboxItemKind;
  /** Source that surfaced this item. */
  sourceId: SourceId | null;
  /** Topic(s) this item matched (may be empty for general alerts). */
  topicIds: TopicId[];
  /** When the item was added to the inbox. */
  receivedAt: string;
  /** UI flags. */
  read: boolean;
  starred: boolean;
  dismissed: boolean;
  /** True iff already saved to Vault (UI dims the "Save" button). */
  savedToVault: boolean;
  /** Bilingual headline (denormalized). */
  headline: LocalizedText;
  /** Bilingual one-line preview (truncated). */
  preview: LocalizedText | null;
}

export interface InboxItemPaper extends InboxItemBase {
  kind: "paper";
  document: DocumentRef;
  /** Backend-generated TL;DR (bilingual). */
  tldr: LocalizedText | null;
}

export interface InboxItemDiscussion extends InboxItemBase {
  kind: "discussion";
  url: string;
  /** Reply / upvote counts. */
  metrics: { replies: number; upvotes: number };
}

export interface InboxItemRelease extends InboxItemBase {
  kind: "release";
  /** GitHub-style ref (e.g. "owner/repo@v1.2.0"). */
  ref: string;
  url: string;
  /** Release notes excerpt (bilingual). */
  excerpt: LocalizedText | null;
}

export interface InboxItemNote extends InboxItemBase {
  kind: "note";
  /** A first-party system note (e.g. onboarding tips). */
  body: LocalizedText;
}

export interface InboxItemAlert extends InboxItemBase {
  kind: "alert";
  severity: "info" | "warning" | "critical";
  /** Optional CTA URL. */
  actionUrl: string | null;
  /** Localized CTA label. */
  actionLabel: LocalizedText | null;
}

export type InboxItem =
  | InboxItemPaper
  | InboxItemDiscussion
  | InboxItemRelease
  | InboxItemNote
  | InboxItemAlert;

// ============================================================================
// List query
// ============================================================================

export type InboxFilter = "all" | "unread" | "starred" | "dismissed";
export type InboxSort = "recent" | "oldest" | "topic" | "source";

export interface ListInboxQuery extends PageQuery {
  filter?: InboxFilter;
  sort?: InboxSort;
  direction?: SortDirection;
  /** Restrict to a topic. */
  topicId?: TopicId;
  /** Restrict to a source. */
  sourceId?: SourceId;
  /** Restrict to a kind. */
  kind?: InboxItemKind;
  /** Free-text query against headline/preview. */
  q?: string;
  /** Restrict to items received after this ISO date. */
  since?: string;
}

// ============================================================================
// Bulk actions
// ============================================================================

export type InboxBulkAction = "read" | "unread" | "star" | "unstar" | "dismiss" | "save";

export interface InboxBulkRequest {
  ids: InboxItemId[];
  action: InboxBulkAction;
}

export interface InboxBulkResponse {
  /** Number of items the action succeeded on. */
  applied: number;
  /** IDs that failed (e.g. already-saved when action=save). */
  failedIds: InboxItemId[];
}

// ============================================================================
// Counters (sidebar badges)
// ============================================================================

export interface InboxCounters {
  unread: number;
  starred: number;
  total: number;
  /** Per-topic unread (only top 10 topics by unread count). */
  byTopic: { topicId: TopicId; unread: number }[];
}
