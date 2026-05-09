/**
 * Claims Domain — evidence-backed assertions.
 *
 * A Claim is an atomic statement (e.g. "Long-context models retrieve
 * needle-in-haystack with >95% accuracy at 128K") supported by one or more
 * Evidence records. Claims appear inline in Briefs (as `.cite` chips) and
 * on dedicated topic pages. Clicking a `.cite` opens the evidence drawer.
 *
 * Endpoints (see openapi/paths/claims.yaml):
 *   GET    /claims                           (list, paginated)
 *   GET    /claims/{id}
 *   GET    /claims/{id}/evidence             (full evidence list with detail)
 *   POST   /claims/{id}/dispute              (user flags a claim as wrong)
 *   GET    /topics/{topicId}/claims          (claims belonging to a topic)
 */

import type {
  AuditFields,
  ClaimId,
  DocumentRef,
  EvidenceId,
  LocalizedText,
  PageQuery,
  SortDirection,
  TopicId,
} from "./_shared";

// ============================================================================
// Claim entity
// ============================================================================

export type ClaimStrength = "strong" | "moderate" | "weak" | "contested";
export type ClaimStance = "supports" | "refutes" | "neutral";

export interface Claim extends AuditFields {
  id: ClaimId;
  topicId: TopicId;
  /** Bilingual statement text — the assertion itself. */
  statement: LocalizedText;
  /** Optional bilingual nuance / scope qualifier. */
  qualifier: LocalizedText | null;
  strength: ClaimStrength;
  /** Evidence count (denormalized). */
  evidenceCount: number;
  /** Counts by stance (denormalized for badge rendering). */
  stanceBreakdown: {
    supports: number;
    refutes: number;
    neutral: number;
  };
  /** UI hint: 0-100 confidence score (combines strength + stance balance). */
  confidence: number;
  /** Has the current user disputed this claim? */
  myDispute: ClaimDispute | null;
  /** First-seen timestamp; useful for "new claim" badges. */
  firstSeenAt: string;
}

export interface ClaimDispute {
  reason: string;
  createdAt: string;
}

// ============================================================================
// Evidence
// ============================================================================

export type EvidenceKind = "paper" | "blog" | "dataset" | "discussion" | "talk";

export interface Evidence extends AuditFields {
  id: EvidenceId;
  claimId: ClaimId;
  kind: EvidenceKind;
  stance: ClaimStance;
  /** Bilingual excerpt / quote being cited. */
  excerpt: LocalizedText;
  /** The underlying document reference. */
  document: DocumentRef;
  /** Optional location pin (page number, timestamp, section). */
  locator: string | null;
  /** Strength weight 0-100 (drives claim aggregation). */
  weight: number;
}

// ============================================================================
// List queries
// ============================================================================

export type ClaimSort = "recent" | "confidence" | "evidence_count";

export interface ListClaimsQuery extends PageQuery {
  sort?: ClaimSort;
  direction?: SortDirection;
  topicId?: TopicId;
  strength?: ClaimStrength;
  /** Free-text against statement. */
  q?: string;
}

export interface ListEvidenceQuery extends PageQuery {
  stance?: ClaimStance;
  kind?: EvidenceKind;
}

// ============================================================================
// Dispute
// ============================================================================

export interface DisputeClaimRequest {
  /** Free-text reason; optional but encouraged. */
  reason: string;
}

export type DisputeClaimResponse = Claim;
