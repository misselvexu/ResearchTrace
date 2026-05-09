/**
 * Auth Domain — login, signup, refresh, OAuth.
 *
 * Endpoints (see openapi/paths/auth.yaml):
 *   POST /auth/signup
 *   POST /auth/login
 *   POST /auth/refresh                (uses HttpOnly cookie)
 *   POST /auth/logout
 *   POST /auth/verify-email
 *   POST /auth/forgot-password
 *   POST /auth/reset-password
 *   GET  /auth/oauth/{provider}       → 302 redirect to provider
 *   GET  /auth/oauth/{provider}/callback
 *   POST /auth/oauth/exchange         (PKCE-style code exchange)
 */

import type { UserId } from "./_shared";

// ============================================================================
// Sign-up
// ============================================================================

export interface SignupRequest {
  email: string;
  /** Plain text; transport over HTTPS only. Backend MUST hash with bcrypt/argon2. */
  password: string;
  /** Optional display name; defaults to email local-part. */
  displayName?: string;
  /** Preferred locale at signup time; backend stores in user prefs. */
  locale?: "zh" | "en";
  /** Marketing-opt-in checkbox state. */
  marketingOptIn?: boolean;
  /** Invite code (for closed beta / referral). Optional. */
  inviteCode?: string;
}

export interface SignupResponse {
  userId: UserId;
  /** Whether email verification was sent (false = auto-verified domains). */
  emailVerificationSent: boolean;
  /** May be null if email verification is required before login. */
  tokens: AuthTokens | null;
}

// ============================================================================
// Login
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  /** Set by signup auto-login flow; backend echoes for telemetry. */
  rememberMe?: boolean;
}

export interface LoginResponse {
  userId: UserId;
  tokens: AuthTokens;
  /** True iff user has verified their email; UI may nudge. */
  emailVerified: boolean;
}

// ============================================================================
// Token bundle
// ============================================================================

/**
 * AuthTokens — what the client receives after auth.
 *
 * Note: `refreshToken` is delivered ONLY via HttpOnly Secure cookie
 * (named `rt-refresh`); it is intentionally absent from this payload.
 * The client never touches the refresh token.
 */
export interface AuthTokens {
  accessToken: string;
  /** Seconds until access token expires (server clock). Default 900 (15 min). */
  expiresIn: number;
  /** Token type for Authorization header. Always "Bearer". */
  tokenType: "Bearer";
}

// ============================================================================
// Refresh
// ============================================================================

/**
 * Refresh request body is empty; the refresh token is read from the
 * HttpOnly cookie set at login. CSRF is mitigated via SameSite=Lax.
 */
export type RefreshRequest = Record<string, never>;
export type RefreshResponse = AuthTokens;

// ============================================================================
// Logout
// ============================================================================

export interface LogoutRequest {
  /** If true, invalidate ALL refresh tokens for this user (sign out everywhere). */
  everywhere?: boolean;
}

export type LogoutResponse = null;

// ============================================================================
// Email verification
// ============================================================================

export interface VerifyEmailRequest {
  /** Token delivered via verification email link. */
  token: string;
}
export interface VerifyEmailResponse {
  userId: UserId;
  emailVerified: true;
}

// ============================================================================
// Password reset
// ============================================================================

export interface ForgotPasswordRequest {
  email: string;
}
/**
 * Always returns success (even if email not found) to prevent enumeration.
 * `delivered` is informational — UI shows a generic "check your inbox" message.
 */
export interface ForgotPasswordResponse {
  delivered: boolean;
}

export interface ResetPasswordRequest {
  /** Token delivered via password-reset email link. */
  token: string;
  newPassword: string;
}
export interface ResetPasswordResponse {
  userId: UserId;
}

// ============================================================================
// OAuth (Google / GitHub)
// ============================================================================

export type OAuthProvider = "google" | "github";

/**
 * Step 1: Frontend redirects browser to GET /auth/oauth/{provider}
 *   Backend issues 302 to provider with PKCE state.
 * Step 2: Provider redirects back to /auth/oauth/{provider}/callback?code=...
 *   Backend exchanges code, sets refresh cookie, redirects to /auth/oauth/return.
 * Step 3: Frontend on /auth/oauth/return calls POST /auth/oauth/exchange
 *   to claim short-lived `handoff` token → returns AuthTokens.
 *
 * The handoff token model avoids exposing the access token in URL fragments.
 */
export interface OAuthExchangeRequest {
  /** One-time handoff token issued by /auth/oauth/{provider}/callback redirect. */
  handoff: string;
}

export interface OAuthExchangeResponse {
  userId: UserId;
  tokens: AuthTokens;
  emailVerified: boolean;
  /** True iff this completed first-time signup via OAuth (UI may show onboarding). */
  isNewUser: boolean;
}
