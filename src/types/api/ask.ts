/**
 * Ask Domain — Q&A composer / chat sessions.
 *
 * The Ask page is a conversational interface where users pose questions
 * scoped to their Vault, a Topic, or the public web. Responses stream
 * incrementally and include inline citations (`.cite` chips) backed by
 * Evidence records.
 *
 * Endpoints (see openapi/paths/ask.yaml):
 *   GET    /ask/sessions                     (list user's sessions, paginated)
 *   POST   /ask/sessions                     (create a new session)
 *   GET    /ask/sessions/{id}
 *   PATCH  /ask/sessions/{id}                (rename, archive)
 *   DELETE /ask/sessions/{id}
 *   GET    /ask/sessions/{id}/messages       (paginated, oldest-first)
 *   POST   /ask/sessions/{id}/messages       (send a user message; streams reply via SSE)
 *   POST   /ask/sessions/{id}/messages/{msgId}/regenerate
 *   POST   /ask/sessions/{id}/messages/{msgId}/feedback
 *   GET    /ask/suggestions                  (UI prompt chips)
 */

import type {
  AskSessionId,
  AuditFields,
  ClaimId,
  EvidenceId,
  LocalizedText,
  MessageId,
  PageQuery,
  SortDirection,
  TopicId,
  UserId,
  VaultItemId,
} from "./_shared";

// ============================================================================
// Scope — what knowledge the assistant draws from
// ============================================================================

export type AskScopeKind = "vault" | "topic" | "web" | "mixed";

/**
 * AskScope — what corpus the assistant searches when answering.
 *   - vault: only the user's saved items
 *   - topic: only content within a specific topic feed
 *   - web:   open web (slower, citations are URLs)
 *   - mixed: union of vault + topic + web (default)
 */
export type AskScope =
  | { kind: "vault"; vaultItemIds?: VaultItemId[] }
  | { kind: "topic"; topicId: TopicId }
  | { kind: "web" }
  | { kind: "mixed"; topicIds?: TopicId[]; includeWeb?: boolean };

// ============================================================================
// Session
// ============================================================================

export interface AskSession extends AuditFields {
  id: AskSessionId;
  ownerId: UserId;
  /** Bilingual title; auto-generated from first user message if not set. */
  title: LocalizedText;
  /** Default scope applied to messages when not overridden. */
  defaultScope: AskScope;
  /** Message count (denormalized). */
  messageCount: number;
  /** Last message timestamp. */
  lastMessageAt: string | null;
  /** Whether archived (hidden from default list). */
  archived: boolean;
  /** Whether pinned to the top of the sidebar. */
  pinned: boolean;
}

export type AskSort = "recent" | "alphabetical" | "messages";

export interface ListSessionsQuery extends PageQuery {
  sort?: AskSort;
  direction?: SortDirection;
  archived?: boolean;
  q?: string;
}

export interface CreateSessionRequest {
  /** Optional title; backend auto-generates if omitted. */
  title?: LocalizedText;
  defaultScope?: AskScope;
}

export interface UpdateSessionRequest {
  title?: LocalizedText;
  defaultScope?: AskScope;
  archived?: boolean;
  pinned?: boolean;
}

// ============================================================================
// Message
// ============================================================================

export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "pending" | "streaming" | "complete" | "failed" | "stopped";

export interface AskMessage extends AuditFields {
  id: MessageId;
  sessionId: AskSessionId;
  role: MessageRole;
  status: MessageStatus;
  /** Plain text (markdown). For user messages this is what they typed.
   *  For assistant messages this is the rendered answer with inline `[cite:N]`
   *  markers that pair with the `citations` array below. */
  content: string;
  /** Scope this specific message used (may differ from session default). */
  scope: AskScope;
  /** Citations referenced in this message. Index = `[cite:N]` marker. */
  citations: AskCitation[];
  /** Optional follow-up suggestions (assistant messages only). */
  followUps: LocalizedText[];
  /** Token usage / latency telemetry (assistant messages only). */
  stats: AskMessageStats | null;
  /** Error details if status === "failed". */
  error: LocalizedText | null;
  /** User feedback (assistant messages only). */
  feedback: AskFeedback | null;
}

/**
 * AskCitation — a single inline citation backing a span of the answer.
 *
 * Citations may point to Evidence records (preferred — fully attributed)
 * or to raw web URLs (open web mode). The discriminator is `kind`.
 */
export type AskCitation =
  | {
      kind: "evidence";
      index: number; // matches [cite:N]
      evidenceId: EvidenceId;
      claimId: ClaimId | null;
      title: LocalizedText;
      url: string;
      excerpt: LocalizedText;
    }
  | {
      kind: "vault";
      index: number;
      vaultItemId: VaultItemId;
      title: LocalizedText;
      excerpt: LocalizedText;
    }
  | {
      kind: "web";
      index: number;
      title: LocalizedText;
      url: string;
      excerpt: LocalizedText;
    };

export interface AskMessageStats {
  startedAt: string;
  finishedAt: string | null;
  ttftMs: number | null;          // time-to-first-token
  durationMs: number | null;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface AskFeedback {
  vote: "up" | "down" | null;
  comment: string | null;
}

// ============================================================================
// Send-message request (streams reply via SSE)
// ============================================================================

export interface SendMessageRequest {
  /** User's question (markdown allowed). */
  content: string;
  /** Override the session's default scope for this turn. */
  scope?: AskScope;
  /** Optional model preference. Backend ignores unknown values. */
  model?: string;
}

/**
 * Server-Sent Events frame schema. Sent on the response stream of
 * POST /ask/sessions/{id}/messages.
 *
 * The stream emits one or more frames terminated by `done`.
 *   - `delta`     incremental text token(s)
 *   - `citation`  a new citation appended (renderer reserves index)
 *   - `followups` final follow-up suggestions
 *   - `stats`     final telemetry
 *   - `error`     terminal error (stream ends)
 *   - `done`      successful end of stream
 */
export type AskStreamEvent =
  | { type: "delta"; messageId: MessageId; text: string }
  | { type: "citation"; messageId: MessageId; citation: AskCitation }
  | { type: "followups"; messageId: MessageId; followUps: LocalizedText[] }
  | { type: "stats"; messageId: MessageId; stats: AskMessageStats }
  | { type: "error"; messageId: MessageId; error: LocalizedText }
  | { type: "done"; messageId: MessageId };

// ============================================================================
// Feedback / regenerate
// ============================================================================

export interface MessageFeedbackRequest {
  vote: "up" | "down" | null;
  comment?: string;
}

export type MessageFeedbackResponse = AskFeedback;

export interface RegenerateMessageRequest {
  /** Optional override scope. */
  scope?: AskScope;
  /** Optional model preference. */
  model?: string;
}

// ============================================================================
// Suggestions (UI prompt chips on the Ask page)
// ============================================================================

export interface AskSuggestion {
  id: string;
  /** Bilingual prompt chip label. */
  label: LocalizedText;
  /** What to send when clicked. */
  prompt: string;
  /** Optional scope to apply. */
  scope?: AskScope;
}

export interface ListSuggestionsResponse {
  suggestions: AskSuggestion[];
}
