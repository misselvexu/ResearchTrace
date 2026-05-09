/**
 * Notifications Domain — system + topic-level notifications.
 *
 * Notifications are user-actionable signals that surface in the in-app
 * notification center (bell icon) and optionally via email/push channels.
 *
 * Distinct from Inbox: Inbox is _content_ to triage; Notifications are
 * _events_ about the system / your topics / your account.
 *
 * Endpoints (see openapi/paths/notifications.yaml):
 *   GET    /notifications                    (list, paginated)
 *   GET    /notifications/{id}
 *   POST   /notifications/{id}/read
 *   POST   /notifications/read-all
 *   DELETE /notifications/{id}
 *   GET    /notifications/preferences
 *   PUT    /notifications/preferences
 *   GET    /notifications/unread-count       (badge polling endpoint)
 */

import type {
  AuditFields,
  LocalizedText,
  NotificationId,
  PageQuery,
  TopicId,
  UserId,
} from "./_shared";

// ============================================================================
// Notification kinds — extensible enum
// ============================================================================

export type NotificationKind =
  | "brief_ready"          // a new brief was generated for one of your topics
  | "topic_heat_spike"     // a topic crossed a heat threshold
  | "agent_finished"       // an agent run completed
  | "agent_failed"         // an agent run failed
  | "source_error"         // a source connector is failing
  | "billing_invoice"      // new invoice issued
  | "billing_payment_failed"
  | "billing_trial_ending"
  | "account_security"     // new device login, password change, etc.
  | "system_announcement"; // platform-wide news (release notes, downtime, ...)

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

// ============================================================================
// Notification entity
// ============================================================================

export interface Notification extends AuditFields {
  id: NotificationId;
  ownerId: UserId;
  kind: NotificationKind;
  severity: NotificationSeverity;
  /** Bilingual title (denormalized for fast rendering). */
  title: LocalizedText;
  /** Bilingual body (one to two sentences). */
  body: LocalizedText;
  /** UI flags. */
  read: boolean;
  /** Optional deep-link URL inside the app. */
  actionUrl: string | null;
  /** Optional CTA label. */
  actionLabel: LocalizedText | null;
  /** Related topic (if applicable). */
  topicId: TopicId | null;
  /** Free-form metadata bag for renderer (kind-specific). */
  metadata: Record<string, unknown>;
}

// ============================================================================
// List query
// ============================================================================

export type NotificationFilter = "all" | "unread" | "read";

export interface ListNotificationsQuery extends PageQuery {
  filter?: NotificationFilter;
  kind?: NotificationKind;
  severity?: NotificationSeverity;
  /** Restrict to a topic. */
  topicId?: TopicId;
}

// ============================================================================
// Counters (badge)
// ============================================================================

export interface UnreadCountResponse {
  unread: number;
  /** Maximum severity among unread (drives badge color). */
  topSeverity: NotificationSeverity | null;
}

// ============================================================================
// Notification preferences (channel routing per kind)
// ============================================================================

export type NotificationChannel = "in_app" | "email" | "push";

/**
 * NotificationPreferences — for each kind, which channels are enabled.
 *
 * Backend default: in_app=true for all; email=true for billing+account_security;
 * push=false everywhere (until user opts in via browser permission).
 */
export type NotificationPreferences = Record<
  NotificationKind,
  Record<NotificationChannel, boolean>
>;

export interface UpdateNotificationPreferencesRequest {
  preferences: Partial<NotificationPreferences>;
}
