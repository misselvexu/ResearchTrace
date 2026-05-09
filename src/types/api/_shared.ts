/**
 * ResearchTrace API — Shared Types
 *
 * Foundation contracts for ALL 12 domains. These types are language-agnostic
 * and must be mirrored 1:1 by the backend (Java/Go/Node/Python regardless).
 *
 * Conventions:
 *  - All timestamps are ISO 8601 strings (UTC). Backend serializes as `Instant`.
 *  - All IDs are branded strings to prevent cross-domain mixups at compile time.
 *  - All user-facing text uses LocalizedText (zh + en).
 *  - All list endpoints return PageResponse<T> with cursor-based pagination.
 *  - All responses are wrapped in ApiResponse<T> envelope.
 *
 * @see docs/api-contract.md for full protocol spec.
 */

// ============================================================================
// Bilingual Text — every user-visible string is bilingual end-to-end
// ============================================================================

/**
 * LocalizedText — bilingual string container.
 *
 * Backend-side: store as JSONB column `text_i18n` or two columns `text_zh` + `text_en`.
 * Frontend-side: pick by `useLocale()` from next-intl.
 *
 * Either field MAY be empty string ""; both empty means "no translation".
 * Frontend MUST fallback to the other locale if requested locale is empty.
 */
export interface LocalizedText {
  zh: string;
  en: string;
}

// ============================================================================
// Branded IDs — compile-time safety against cross-domain ID confusion
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type UserId         = Brand<string, "UserId">;
export type TopicId        = Brand<string, "TopicId">;
export type SourceId       = Brand<string, "SourceId">;
export type InboxItemId    = Brand<string, "InboxItemId">;
export type VaultItemId    = Brand<string, "VaultItemId">;
export type BriefId        = Brand<string, "BriefId">;
export type ClaimId        = Brand<string, "ClaimId">;
export type EvidenceId     = Brand<string, "EvidenceId">;
export type AskSessionId   = Brand<string, "AskSessionId">;
export type MessageId      = Brand<string, "MessageId">;
export type AgentId        = Brand<string, "AgentId">;
export type AgentRunId     = Brand<string, "AgentRunId">;
export type NotificationId = Brand<string, "NotificationId">;
export type SubscriptionId = Brand<string, "SubscriptionId">;
export type InvoiceId      = Brand<string, "InvoiceId">;
export type RequestId      = Brand<string, "RequestId">;

/** Cast a raw string to a branded ID. Use sparingly — only at API boundaries. */
export const asId = <T extends string>(s: string): T => s as T;

// ============================================================================
// Response Envelope — every endpoint wraps its data in this shape
// ============================================================================

/**
 * ApiResponse<T> — the universal response envelope.
 *
 * `code === 0` indicates success; non-zero means business error.
 * HTTP status codes still apply for transport errors (4xx/5xx).
 *
 * Backend example (Spring):
 *   return ApiResponse.ok(data);
 *   return ApiResponse.error(ErrorCode.TOPIC_NOT_FOUND, requestId);
 */
export interface ApiResponse<T> {
  /** 0 = success; otherwise see ErrorCode enum. */
  code: number;
  /** Human-readable message (English; client localizes via ErrorCode). */
  message: string;
  /** The actual payload. `null` on error. */
  data: T | null;
  /** Server-generated request ID for tracing/support. */
  requestId: RequestId;
  /** Server timestamp (ISO 8601 UTC). */
  timestamp: string;
}

/**
 * PageResponse<T> — cursor-based pagination wrapper.
 *
 * Why cursor not offset? Stable under concurrent inserts, infinite-scroll
 * friendly, and avoids deep-pagination performance cliffs.
 *
 * Frontend usage:
 *   const next = await fetch(`/api/v1/topics?cursor=${page.nextCursor}`)
 */
export interface PageResponse<T> {
  items: T[];
  /** Opaque cursor for the next page; null = no more pages. */
  nextCursor: string | null;
  /** Estimated total count. May be approximate for performance. */
  totalEstimate: number;
  /** Page size actually returned (may be < requested limit). */
  size: number;
}

/** Generic page request params. All endpoints accept these. */
export interface PageQuery {
  cursor?: string;
  /** Default 20, max 100. */
  limit?: number;
}

// ============================================================================
// Error Codes — single source of truth for all business errors
// ============================================================================

/**
 * ErrorCode — every business error is one of these.
 *
 * Numbering scheme:
 *   0           = Success
 *   10000-10999 = Auth & User domain
 *   11000-11999 = Topics & Sources domain
 *   12000-12999 = Inbox & Vault domain
 *   13000-13999 = Briefs & Claims domain
 *   14000-14999 = Ask & Agents domain
 *   15000-15999 = Notifications domain
 *   16000-16999 = Billing domain
 *   90000-90999 = Generic / infrastructure
 *
 * Frontend MUST map these to localized i18n keys: `errors.${ErrorCode}`.
 */
export enum ErrorCode {
  Success = 0,

  // Auth & User (10xxx)
  AuthInvalidCredentials   = 10001,
  AuthTokenExpired         = 10002,
  AuthTokenInvalid         = 10003,
  AuthRefreshExpired       = 10004,
  AuthOAuthFailed          = 10005,
  AuthEmailTaken           = 10006,
  AuthEmailNotVerified     = 10007,
  AuthPasswordWeak         = 10008,
  AuthRateLimited          = 10009,
  UserNotFound             = 10101,
  UserSuspended            = 10102,
  UserPlanInsufficient     = 10103,

  // Topics & Sources (11xxx)
  TopicNotFound            = 11001,
  TopicQuotaExceeded       = 11002,
  TopicAlreadySubscribed   = 11003,
  SourceNotFound           = 11101,
  SourceUnreachable        = 11102,
  SourceQuotaExceeded      = 11103,

  // Inbox & Vault (12xxx)
  InboxItemNotFound        = 12001,
  VaultItemNotFound        = 12101,
  VaultStorageExceeded     = 12102,

  // Briefs & Claims (13xxx)
  BriefNotFound            = 13001,
  BriefGenerationFailed    = 13002,
  ClaimNotFound            = 13101,
  EvidenceNotFound         = 13102,

  // Ask & Agents (14xxx)
  AskSessionNotFound       = 14001,
  AskQuotaExceeded         = 14002,
  AgentNotFound            = 14101,
  AgentRunFailed           = 14102,

  // Notifications (15xxx)
  NotificationNotFound     = 15001,

  // Billing (16xxx)
  BillingPlanNotFound      = 16001,
  BillingPaymentFailed     = 16002,
  BillingSubscriptionLocked = 16003,

  // Generic (9xxxx)
  ValidationFailed         = 90001,
  Unauthorized             = 90401,
  Forbidden                = 90403,
  NotFound                 = 90404,
  Conflict                 = 90409,
  TooManyRequests          = 90429,
  InternalError            = 90500,
  ServiceUnavailable       = 90503,
}

// ============================================================================
// Common shape primitives
// ============================================================================

/** Audit timestamps embedded in every persisted entity. */
export interface AuditFields {
  createdAt: string;
  updatedAt: string;
}

/** Soft-delete marker (optional, only on entities that support it). */
export interface SoftDeleteFields {
  deletedAt: string | null;
}

/** A reference to a remote document (paper, blog post, dataset, etc.). */
export interface DocumentRef {
  /** Globally-unique URL. Used as the natural key. */
  url: string;
  /** Bilingual title; falls back to `url` if both empty. */
  title: LocalizedText;
  /** Optional canonical DOI. */
  doi?: string;
  /** Optional arXiv identifier. */
  arxivId?: string;
  /** Publisher / venue (e.g. "NeurIPS 2024", "arXiv"). */
  venue?: string;
  /** Authors as plain strings; backend MAY enrich to `Author[]` later. */
  authors?: string[];
  /** Publication date (ISO 8601 date or datetime). */
  publishedAt?: string;
  /** Primary language of the document. */
  language?: "zh" | "en" | "other";
}

/**
 * SortDirection — used in list query params.
 * String form (not boolean) for self-documenting URLs.
 */
export type SortDirection = "asc" | "desc";

/**
 * IsoDateString — branded marker (purely documentation; runtime is string).
 * Use when an ISO 8601 timestamp is required.
 */
export type IsoDateString = string;

// ============================================================================
// Helper type aliases (re-exported for convenience)
// ============================================================================

/** Strip nullability for use after a null-check. */
export type NonNull<T> = T extends null | undefined ? never : T;
