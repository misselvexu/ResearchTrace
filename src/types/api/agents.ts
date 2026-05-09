/**
 * Agents Domain — background workers / orchestrations.
 *
 * Agents are server-side automation units that perform multi-step tasks:
 *   - Daily/weekly brief generation per topic
 *   - Source ingestion crawls
 *   - Vault enrichment (auto-tagging, summarization)
 *   - User-defined "watch" agents (custom triggers + actions)
 *
 * Endpoints (see openapi/paths/agents.yaml):
 *   GET    /agents                           (list user's agents)
 *   POST   /agents                           (create custom agent)
 *   GET    /agents/{id}
 *   PATCH  /agents/{id}                      (rename, enable/disable, edit config)
 *   DELETE /agents/{id}
 *   POST   /agents/{id}/run                  (trigger immediately, returns run id)
 *   GET    /agents/{id}/runs                 (run history, paginated)
 *   GET    /agents/runs/{runId}              (run detail with step log)
 *   POST   /agents/runs/{runId}/cancel
 *   GET    /agents/templates                 (gallery of pre-built agents)
 */

import type {
  AgentId,
  AgentRunId,
  AuditFields,
  LocalizedText,
  PageQuery,
  SortDirection,
  SourceId,
  TopicId,
  UserId,
} from "./_shared";

// ============================================================================
// Agent kinds
// ============================================================================

export type AgentKind =
  | "brief_generator"
  | "source_crawler"
  | "vault_enricher"
  | "topic_watcher"      // user-defined "alert me when …"
  | "ask_followup"       // proactive Q&A surfacing
  | "custom";            // user-built via templates

export type AgentStatus = "enabled" | "disabled" | "error";

// ============================================================================
// Trigger — when does the agent run?
// ============================================================================

export type AgentTrigger =
  | { kind: "manual" }
  | { kind: "schedule"; cron: string; timezone: string }
  | { kind: "interval"; everyMinutes: number }
  | { kind: "event"; event: AgentEvent };

export type AgentEvent =
  | "topic_new_item"      // a new item arrived in a topic
  | "topic_heat_spike"    // topic heat crossed threshold
  | "source_synced"       // a source completed a sync
  | "vault_added"         // user saved a new vault item
  | "brief_ready";        // a brief finished

// ============================================================================
// Agent entity
// ============================================================================

export interface Agent extends AuditFields {
  id: AgentId;
  ownerId: UserId;
  kind: AgentKind;
  /** Bilingual name (user-editable). */
  name: LocalizedText;
  /** Bilingual description. */
  description: LocalizedText | null;
  status: AgentStatus;
  trigger: AgentTrigger;
  /** Kind-specific configuration (validated by backend per kind). */
  config: AgentConfig;
  /** Last successful run timestamp. */
  lastRunAt: string | null;
  /** Last run status (for badge rendering). */
  lastRunStatus: AgentRunStatus | null;
  /** Total runs count (denormalized). */
  runCount: number;
  /** Most recent error (bilingual). */
  lastError: LocalizedText | null;
}

/**
 * AgentConfig — discriminated by parent `Agent.kind`.
 * Backend validates per-kind via JSON schema.
 */
export type AgentConfig =
  | {
      kind: "brief_generator";
      topicIds: TopicId[];
      cadence: "daily" | "weekly" | "monthly";
      sections: string[]; // BriefSectionKind values
    }
  | {
      kind: "source_crawler";
      sourceIds: SourceId[];
    }
  | {
      kind: "vault_enricher";
      autoTag: boolean;
      autoSummarize: boolean;
    }
  | {
      kind: "topic_watcher";
      topicId: TopicId;
      condition: TopicWatcherCondition;
      action: TopicWatcherAction;
    }
  | {
      kind: "ask_followup";
      maxSuggestionsPerDay: number;
    }
  | {
      kind: "custom";
      /** User-authored DSL/script payload (opaque blob — backend interprets). */
      script: string;
      /** Free-form key/value parameters. */
      params: Record<string, string | number | boolean>;
    };

export type TopicWatcherCondition =
  | { kind: "heat_above"; threshold: number }
  | { kind: "keyword_match"; terms: string[] }
  | { kind: "new_item_count"; minPerDay: number };

export type TopicWatcherAction =
  | { kind: "notify" }
  | { kind: "create_brief" }
  | { kind: "save_to_vault"; tags?: string[] };

// ============================================================================
// Agent runs (execution records)
// ============================================================================

export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

export interface AgentRun {
  id: AgentRunId;
  agentId: AgentId;
  status: AgentRunStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  /** Reason for trigger (manual / scheduled / event). */
  triggerReason: string;
  /** Step log (for UI timeline). */
  steps: AgentRunStep[];
  /** Bilingual outcome summary. */
  summary: LocalizedText | null;
  /** Bilingual error if failed. */
  error: LocalizedText | null;
  /** Output artifact references (briefs created, items ingested, etc.). */
  outputs: AgentRunOutput[];
}

export interface AgentRunStep {
  index: number;
  /** Bilingual step name. */
  name: LocalizedText;
  status: "pending" | "running" | "succeeded" | "failed" | "skipped";
  startedAt: string | null;
  finishedAt: string | null;
  /** Bilingual log message. */
  message: LocalizedText | null;
}

export type AgentRunOutput =
  | { kind: "brief"; briefId: string }
  | { kind: "vault_item"; vaultItemId: string }
  | { kind: "notification"; notificationId: string }
  | { kind: "ingested_count"; count: number };

// ============================================================================
// List queries
// ============================================================================

export type AgentSort = "recent" | "alphabetical" | "lastRun";

export interface ListAgentsQuery extends PageQuery {
  sort?: AgentSort;
  direction?: SortDirection;
  kind?: AgentKind;
  status?: AgentStatus;
  q?: string;
}

export interface ListAgentRunsQuery extends PageQuery {
  status?: AgentRunStatus;
  /** Restrict to runs newer than this ISO timestamp. */
  since?: string;
}

// ============================================================================
// Mutations
// ============================================================================

export interface CreateAgentRequest {
  kind: AgentKind;
  name: LocalizedText;
  description?: LocalizedText;
  trigger: AgentTrigger;
  config: AgentConfig;
  /** Default true. */
  enabled?: boolean;
}

export interface UpdateAgentRequest {
  name?: LocalizedText;
  description?: LocalizedText | null;
  trigger?: AgentTrigger;
  config?: AgentConfig;
  status?: AgentStatus;
}

export interface RunAgentResponse {
  runId: AgentRunId;
  startedAt: string;
}

// ============================================================================
// Templates (gallery)
// ============================================================================

export interface AgentTemplate {
  id: string;
  kind: AgentKind;
  /** Bilingual display name. */
  name: LocalizedText;
  /** Bilingual one-paragraph description. */
  description: LocalizedText;
  /** Icon URL (CDN). */
  iconUrl: string;
  /** Whether this template is in the curated "popular" set. */
  popular: boolean;
  /** Default config (cloned when user instantiates). */
  defaultConfig: AgentConfig;
  defaultTrigger: AgentTrigger;
}

export interface ListTemplatesResponse {
  templates: AgentTemplate[];
}
