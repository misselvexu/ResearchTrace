/**
 * Briefs Domain — generated research briefs.
 *
 * A Brief is a structured, citation-backed digest of recent activity within
 * a topic. Briefs are produced by background agents on a schedule (daily/
 * weekly per topic) or on-demand. They are the centerpiece of the "Today"
 * and "Briefs" pages in the UI.
 *
 * Endpoints (see openapi/paths/briefs.yaml):
 *   GET    /briefs                           (list, paginated, filterable)
 *   POST   /briefs                           (manually request a brief generation)
 *   GET    /briefs/{id}
 *   POST   /briefs/{id}/regenerate           (force re-run with same params)
 *   POST   /briefs/{id}/save                 (forward to Vault)
 *   POST   /briefs/{id}/share                (returns short share URL)
 *   POST   /briefs/{id}/feedback             (thumbs up/down + free text)
 *   GET    /briefs/{id}/export               (markdown / pdf signed URL)
 */

import type {
  AuditFields,
  BriefId,
  ClaimId,
  LocalizedText,
  PageQuery,
  SortDirection,
  TopicId,
  UserId,
} from "./_shared";

// ============================================================================
// Brief lifecycle
// ============================================================================

export type BriefStatus = "queued" | "running" | "ready" | "failed";

/** What time window the brief covers. */
export type BriefCadence = "daily" | "weekly" | "monthly" | "ad_hoc";

// ============================================================================
// Brief entity
// ============================================================================

export interface Brief extends AuditFields {
  id: BriefId;
  ownerId: UserId;
  topicId: TopicId;
  status: BriefStatus;
  cadence: BriefCadence;
  /** Window start (inclusive). */
  windowStart: string;
  /** Window end (exclusive). */
  windowEnd: string;
  /** Bilingual headline (the "kicker" + main title). */
  headline: LocalizedText;
  /** Bilingual deck — one-paragraph summary above the fold. */
  deck: LocalizedText | null;
  /** Structured body sections (in render order). */
  sections: BriefSection[];
  /** Top-level claim IDs surfaced in the deck. */
  highlightClaimIds: ClaimId[];
  /** Word count (denormalized). */
  wordCount: number;
  /** Reading time in minutes (denormalized). */
  readingTimeMin: number;
  /** Generation cost (LLM tokens, sec) — for telemetry, hidden from end users. */
  generationStats: BriefGenerationStats | null;
  /** User feedback aggregate. */
  feedback: BriefFeedbackSummary;
  /** Whether saved to Vault. */
  savedToVault: boolean;
  /** Public share token (null = not shared). */
  shareToken: string | null;
}

export interface BriefGenerationStats {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface BriefFeedbackSummary {
  upvotes: number;
  downvotes: number;
  /** Has the current user voted? null = no vote. */
  myVote: "up" | "down" | null;
}

// ============================================================================
// Brief sections — discriminated by `kind`
// ============================================================================

export type BriefSectionKind =
  | "summary"      // bullet-point overview
  | "what_changed" // since last brief
  | "claims"       // a list of evidence-backed claims
  | "papers"       // featured papers
  | "discussions"  // notable discussion threads
  | "quotes"       // standout quotes from sources
  | "watchlist";   // "things to watch" callouts

export interface BriefSectionBase {
  kind: BriefSectionKind;
  /** Bilingual section title. */
  title: LocalizedText;
}

export interface BriefSectionSummary extends BriefSectionBase {
  kind: "summary";
  bullets: LocalizedText[];
}

export interface BriefSectionWhatChanged extends BriefSectionBase {
  kind: "what_changed";
  diff: LocalizedText[];
}

export interface BriefSectionClaims extends BriefSectionBase {
  kind: "claims";
  claimIds: ClaimId[];
}

export interface BriefSectionPapers extends BriefSectionBase {
  kind: "papers";
  /** Inline references to documents. The full DocumentRef is fetched separately. */
  paperIds: string[];
}

export interface BriefSectionDiscussions extends BriefSectionBase {
  kind: "discussions";
  discussionIds: string[];
}

export interface BriefSectionQuotes extends BriefSectionBase {
  kind: "quotes";
  quotes: BriefQuote[];
}

export interface BriefSectionWatchlist extends BriefSectionBase {
  kind: "watchlist";
  items: LocalizedText[];
}

export interface BriefQuote {
  text: LocalizedText;
  /** Attribution (bilingual). */
  attribution: LocalizedText;
  /** Source URL. */
  sourceUrl: string;
}

export type BriefSection =
  | BriefSectionSummary
  | BriefSectionWhatChanged
  | BriefSectionClaims
  | BriefSectionPapers
  | BriefSectionDiscussions
  | BriefSectionQuotes
  | BriefSectionWatchlist;

// ============================================================================
// List query
// ============================================================================

export type BriefSort = "recent" | "headline" | "topic";

export interface ListBriefsQuery extends PageQuery {
  sort?: BriefSort;
  direction?: SortDirection;
  /** Filter by topic. */
  topicId?: TopicId;
  status?: BriefStatus;
  cadence?: BriefCadence;
  /** Items published after this ISO date. */
  since?: string;
  /** Free-text against headline/deck. */
  q?: string;
}

// ============================================================================
// Mutations
// ============================================================================

export interface CreateBriefRequest {
  topicId: TopicId;
  cadence?: BriefCadence;
  /** Override window if you want a custom range. */
  windowStart?: string;
  windowEnd?: string;
}

export interface BriefFeedbackRequest {
  vote: "up" | "down" | null;
  /** Optional free-text comment. */
  comment?: string;
}

export type BriefFeedbackResponse = BriefFeedbackSummary;

// ============================================================================
// Sharing
// ============================================================================

export interface ShareBriefResponse {
  shareToken: string;
  /** Public URL (e.g. https://researchtrace.com/share/{token}). */
  shareUrl: string;
  /** ISO 8601; null = no expiry. */
  expiresAt: string | null;
}

// ============================================================================
// Export
// ============================================================================

export type BriefExportFormat = "markdown" | "pdf" | "html";

export interface BriefExportResponse {
  format: BriefExportFormat;
  signedUrl: string;
  expiresAt: string;
}
