/**
 * User Domain — profile, preferences, plan info.
 *
 * Endpoints (see openapi/paths/user.yaml):
 *   GET   /user/me
 *   PATCH /user/me
 *   PUT   /user/me/preferences
 *   GET   /user/me/plan
 *   POST  /user/me/avatar             (multipart/form-data)
 *   DELETE /user/me                    (account deletion, async)
 *   POST  /user/me/change-password
 */

import type { AuditFields, LocalizedText, UserId } from "./_shared";

// ============================================================================
// User profile
// ============================================================================

export type UserRole = "user" | "admin" | "support";
export type UserStatus = "active" | "suspended" | "pending_deletion";

export interface UserProfile extends AuditFields {
  id: UserId;
  email: string;
  displayName: string;
  /** Avatar URL (CDN); null = use generated default. */
  avatarUrl: string | null;
  /** Optional one-line bio, bilingual. */
  bio: LocalizedText | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  /** ISO 8601; null until first login. */
  lastLoginAt: string | null;
}

// ============================================================================
// User preferences
// ============================================================================

export type ThemeMode = "light" | "dark" | "system";
export type Locale = "zh" | "en";

/**
 * UserPreferences — controls UI behavior. Mirrors localStorage keys
 * (`rt-theme`, `rt-lang`) for SSR consistency.
 */
export interface UserPreferences {
  locale: Locale;
  theme: ThemeMode;
  /** Email digest cadence (null = no digest). */
  digestFrequency: "daily" | "weekly" | "never";
  /** Default sort for Topics list. */
  topicsSortDefault: "recent" | "alphabetical" | "activity";
  /** Default Inbox filter. */
  inboxFilterDefault: "all" | "unread" | "starred";
  /** Whether to send "new brief ready" push notifications. */
  pushNewBrief: boolean;
  /** Whether to send "agent finished" push notifications. */
  pushAgentDone: boolean;
  /** Timezone (IANA); defaults to "UTC". Used for digest scheduling. */
  timezone: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: LocalizedText | null;
}

export interface UpdatePreferencesRequest extends Partial<UserPreferences> {}

// ============================================================================
// Plan info (read-only here; mutations live in Billing domain)
// ============================================================================

export type PlanTier = "free" | "pro" | "team" | "enterprise";

export interface UserPlan {
  tier: PlanTier;
  /** Human-readable label. */
  label: LocalizedText;
  /** ISO 8601 expiry; null for free tier or perpetual. */
  expiresAt: string | null;
  /** Quota snapshots — UI displays as progress bars. */
  quotas: {
    topics: { used: number; limit: number };
    sources: { used: number; limit: number };
    vaultBytes: { used: number; limit: number };
    briefsPerMonth: { used: number; limit: number };
    askPerDay: { used: number; limit: number };
  };
  /** True iff user can upgrade (UI shows the upsell CTA). */
  upgradeAvailable: boolean;
}

// ============================================================================
// Password change
// ============================================================================

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
export type ChangePasswordResponse = null;

// ============================================================================
// Account deletion
// ============================================================================

export interface DeleteAccountRequest {
  /** Confirmation password to prevent accidental deletion. */
  password: string;
  /** Optional reason for telemetry. */
  reason?: string;
}

/** Returns deletion job; user receives email when purge completes (≤ 30 days). */
export interface DeleteAccountResponse {
  scheduledAt: string;
  /** Hard-delete cutoff; user can cancel via /user/me/cancel-deletion until then. */
  purgeAt: string;
}
