/**
 * Topics Domain — research topic subscriptions.
 *
 * Endpoints (see openapi/paths/topics.yaml):
 *   GET    /topics                       (list, paginated, filterable)
 *   POST   /topics                       (create)
 *   GET    /topics/{id}
 *   PATCH  /topics/{id}                  (update name/keywords/sources)
 *   DELETE /topics/{id}
 *   POST   /topics/{id}/subscribe
 *   POST   /topics/{id}/unsubscribe
 *   POST   /topics/{id}/pin
 *   POST   /topics/{id}/unpin
 *   GET    /topics/{id}/feed             (latest items in this topic)
 *   GET    /topics/{id}/stats            (heat, trend, sources breakdown)
 */

import type {
  AuditFields,
  DocumentRef,
  LocalizedText,
  PageQuery,
  SortDirection,
  SourceId,
  TopicId,
  UserId,
} from "./_shared";

// ============================================================================
// Topic
// ============================================================================

export type TopicStatus = "active" | "paused" | "archived";

/**
 * Topic — a research subject the user follows.
 *
 * Heat is a 0-100 normalized score derived from recent volume + novelty
 * + citation velocity. UI maps to `.heat-low | .heat-mid | .heat-high`
 * pill colors (see legacy tokens.css).
 */
export interface Topic extends AuditFields {
  id: TopicId;
  ownerId: UserId;
  /** Bilingual display name (user-edited). */
  name: LocalizedText;
  /** Bilingual one-line summary; nullable. */
  summary: LocalizedText | null;
  /** Search keywords; backend uses these to ingest. */
  keywords: string[];
  /** Source IDs the topic listens to (subset of user's connected sources). */
  sourceIds: SourceId[];
  /** UI accent — maps to `--accent-${color}` token. */
  color: TopicColor;
  status: TopicStatus;
  /** Whether the topic appears in sidebar pinned section. */
  pinned: boolean;
  /** Whether the user has muted notifications for this topic. */
  muted: boolean;
  /** 0-100 heat score (see field doc above). */
  heat: number;
  /** Item count in last 7 days (denormalized for list rendering). */
  recentItemCount: number;
  /** Last activity timestamp. */
  lastActivityAt: string | null;
  /** Reference to the latest brief, if any (denormalized). */
  lastBrief: TopicLastBriefRef | null;
}

export type TopicColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "indigo"
  | "purple"
  | "neutral";

export interface TopicLastBriefRef {
  briefId: string;
  publishedAt: string;
  /** Headline (bilingual, denormalized). */
  headline: LocalizedText;
}

// ============================================================================
// List query
// ============================================================================

export type TopicSort = "recent" | "alphabetical" | "activity" | "heat";

export interface ListTopicsQuery extends PageQuery {
  sort?: TopicSort;
  direction?: SortDirection;
  /** Free-text filter against name/keywords. */
  q?: string;
  status?: TopicStatus;
  pinned?: boolean;
  /** Filter by accent color (UI quick-filter). */
  color?: TopicColor;
}

// ============================================================================
// Mutations
// ============================================================================

export interface CreateTopicRequest {
  name: LocalizedText;
  summary?: LocalizedText;
  keywords: string[];
  sourceIds: SourceId[];
  color?: TopicColor;
  pinned?: boolean;
}

export interface UpdateTopicRequest {
  name?: LocalizedText;
  summary?: LocalizedText | null;
  keywords?: string[];
  sourceIds?: SourceId[];
  color?: TopicColor;
  status?: TopicStatus;
  muted?: boolean;
}

// ============================================================================
// Topic feed (paginated items inside a topic)
// ============================================================================

export type TopicFeedTab = "all" | "papers" | "discussions" | "datasets";

export interface ListTopicFeedQuery extends PageQuery {
  tab?: TopicFeedTab;
  /** Restrict to items newer than this ISO timestamp. */
  since?: string;
}

/**
 * TopicFeedItem — a single entry shown in topic.html "Today" / "Recent" lists.
 * Discriminated by `kind` so UI renders different cards.
 */
export type TopicFeedItem =
  | TopicFeedItemPaper
  | TopicFeedItemDiscussion
  | TopicFeedItemDataset;

interface TopicFeedItemBase {
  id: string;
  topicId: TopicId;
  /** Heat contribution of this item (0-100). */
  heat: number;
  /** When the item entered the user's feed (not the source publish date). */
  ingestedAt: string;
  /** Whether the user has read it. */
  read: boolean;
  /** Whether saved to Vault. */
  saved: boolean;
}

export interface TopicFeedItemPaper extends TopicFeedItemBase {
  kind: "paper";
  document: DocumentRef;
  /** Backend-generated bilingual TL;DR. */
  tldr: LocalizedText | null;
}

export interface TopicFeedItemDiscussion extends TopicFeedItemBase {
  kind: "discussion";
  url: string;
  title: LocalizedText;
  excerpt: LocalizedText | null;
  /** Reply count etc. */
  metrics: {
    replies: number;
    upvotes: number;
  };
}

export interface TopicFeedItemDataset extends TopicFeedItemBase {
  kind: "dataset";
  url: string;
  name: LocalizedText;
  /** Size in bytes (informational). */
  sizeBytes: number | null;
  license: string | null;
}

// ============================================================================
// Topic stats
// ============================================================================

export interface TopicStats {
  topicId: TopicId;
  /** 7-day rolling heat sparkline (length 7, oldest → newest). */
  heatSeries: number[];
  /** Volume by day (length 7). */
  volumeSeries: number[];
  /** Top 5 contributing sources (by item count, last 30 days). */
  topSources: { sourceId: SourceId; sourceName: LocalizedText; count: number }[];
  /** Top 8 keyword chips (term frequency, last 30 days). */
  topKeywords: { term: string; weight: number }[];
}
