/**
 * Settings page — live overlay module.
 *
 * Provides typed read/save helpers for user profile, preferences, plan
 * quotas, and account-level mutations (logout, delete account, change
 * password, avatar upload). Keeps the editorial scaffold in `page.tsx`
 * intact while overlaying real data from MSW-backed endpoints.
 */

"use client";

import { useEffect, useState } from "react";
import { api, isApiError } from "@/lib/api";
import { handleApiError } from "@/lib/handle-api-error";
import { invalidate, userMeQuery, userPlanQuery, userPreferencesQuery } from "@/lib/queries";
import { signOut } from "@/lib/auth";
import { toast } from "@/components/providers/toast";
import type {
  ChangePasswordRequest,
  DeleteAccountResponse,
  LocalizedText,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
  UserPlan,
  UserPreferences,
  UserProfile,
} from "@/types/api";

// ---------------------------------------------------------------------------
// i18n util — pick zh/en value from a LocalizedText with a safe fallback
// ---------------------------------------------------------------------------

export function pickLocale(
  text: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!text) return "";
  if (locale === "en") return text.en || text.zh || "";
  return text.zh || text.en || "";
}

// ---------------------------------------------------------------------------
// Combined live state
// ---------------------------------------------------------------------------

export interface SettingsLive {
  profile: UserProfile | null;
  prefs: UserPreferences | null;
  plan: UserPlan | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Single-shot loader that fans out profile + prefs + plan in parallel.
 * Uses Promise.allSettled so any one domain failing degrades gracefully.
 */
export function useSettingsLive(): SettingsLive {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([userMeQuery(), userPreferencesQuery(), userPlanQuery()])
      .then(([pR, prR, plR]) => {
        if (cancelled) return;
        if (pR.status === "fulfilled") setProfile(pR.value);
        if (prR.status === "fulfilled") setPrefs(prR.value);
        if (plR.status === "fulfilled") setPlan(plR.value);
        const failed = [pR, prR, plR].filter((r) => r.status === "rejected");
        if (failed.length === 3) {
          setError("Failed to load settings");
        } else {
          setError(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    profile,
    prefs,
    plan,
    loading,
    error,
    refresh: () => {
      invalidate(["user.me", "user.prefs", "user.plan"]);
      setTick((n) => n + 1);
    },
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

type T = (key: string) => string;

export async function saveProfile(
  body: UpdateProfileRequest,
  t: T,
): Promise<UserProfile | null> {
  try {
    const next = await api.patch<UserProfile, UpdateProfileRequest>("/user/me", body);
    invalidate(["user.me"]);
    toast.success(t("settings.profile.alertSaved"));
    return next;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

/**
 * Avatar upload — backend accepts multipart/form-data on POST
 * /user/me/avatar. Mock simply echoes a data: URL so the UI can preview.
 */
export async function uploadAvatar(file: File, t: T): Promise<string | null> {
  // Read as data URL so we can show a preview without an actual upload step
  // (MSW handler isn't wired for multipart in this prototype).
  return new Promise<string | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      toast.success(t("settings.profile.alertAvatar"));
      resolve(url || null);
    };
    reader.onerror = () => {
      toast.error(t("settings.profile.alertAvatarFailed"));
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}

export async function savePreferences(
  body: UpdatePreferencesRequest,
  t: T,
  silent = false,
): Promise<UserPreferences | null> {
  try {
    const next = await api.put<UserPreferences, UpdatePreferencesRequest>(
      "/user/me/preferences",
      body,
    );
    invalidate(["user.prefs"]);
    if (!silent) toast.success(t("settings.delivery.alertSaved"));
    return next;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  t: T,
): Promise<boolean> {
  try {
    await api.post<null, ChangePasswordRequest>("/user/me/change-password", {
      oldPassword,
      newPassword,
    });
    toast.success(t("settings.profile.alertPassword"));
    return true;
  } catch (err) {
    if (isApiError(err)) {
      toast.error(err.message || t("settings.profile.alertPasswordFailed"));
    } else {
      toast.error(t("settings.profile.alertPasswordFailed"));
    }
    return false;
  }
}

export async function deleteAccount(t: T): Promise<DeleteAccountResponse | null> {
  try {
    const res = await api.delete<DeleteAccountResponse>("/user/me");
    toast.success(t("settings.data.alertDeleted"));
    return res;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function exportUserData(t: T): Promise<void> {
  // Best-effort export — uses the Vault export endpoint (already wired in B10.2).
  try {
    await api.post<{ jobId?: string }, { format: string }>("/vault/export", {
      format: "zip_markdown",
    });
    toast.success(t("settings.data.alertExport"));
  } catch (err) {
    handleApiError(err, t);
  }
}

export async function logout(t: T): Promise<void> {
  try {
    await api.post<null, Record<string, never>>("/auth/logout", {});
  } catch {
    // Even if the network call fails, we clear the local session.
  }
  signOut();
  toast.success(t("settings.btn.alertLogout"));
}

// ---------------------------------------------------------------------------
// Derived view-model helpers
// ---------------------------------------------------------------------------

export function formatBytes(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} GB`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} KB`;
  return `${n} B`;
}

/** Convert plan quotas → 4 stat cards rendered on the Settings → Plan section. */
export interface PlanStat {
  k: string;
  v: string;
}

export function planStatsFromQuota(plan: UserPlan | null): PlanStat[] {
  if (!plan) return [];
  const q = plan.quotas;
  const lim = (n: number, infZero = false) =>
    infZero && n === 0 ? "∞" : n.toLocaleString();
  return [
    { k: "VAULT", v: `${formatBytes(q.vaultBytes.used)} / ${formatBytes(q.vaultBytes.limit)}` },
    {
      k: "ASK",
      v: `${q.askPerDay.used} / ${lim(q.askPerDay.limit)} today`,
    },
    {
      k: "TOPICS",
      v: `${q.topics.used} / ${lim(q.topics.limit)}`,
    },
    {
      k: "BRIEFS",
      v: `${q.briefsPerMonth.used} / ${lim(q.briefsPerMonth.limit)} monthly`,
    },
  ];
}

/** Map UserPreferences → the 5 cadence toggles on /settings. */
export function cadenceFromPrefs(p: UserPreferences | null): boolean[] {
  if (!p) return [true, true, true, true, false];
  return [
    p.digestFrequency === "daily" || p.digestFrequency === "weekly", // r1 daily digest
    p.pushNewBrief, // r2 new brief push
    p.pushAgentDone, // r3 agent done push
    p.digestFrequency === "weekly", // r4 weekly summary
    false, // r5 marketing — not stored in this preference shape
  ];
}

/**
 * Convert a cadence-toggle index change back into a preference patch.
 * Returns null if the change isn't representable in UserPreferences.
 */
export function patchFromCadenceToggle(
  index: number,
  next: boolean,
  prev: UserPreferences | null,
): UpdatePreferencesRequest | null {
  if (!prev) return null;
  switch (index) {
    case 0:
      return {
        digestFrequency: next ? "daily" : "never",
      };
    case 1:
      return { pushNewBrief: next };
    case 2:
      return { pushAgentDone: next };
    case 3:
      return {
        digestFrequency: next ? "weekly" : prev.digestFrequency === "weekly" ? "never" : prev.digestFrequency,
      };
    default:
      return null;
  }
}

/** Profile field overlays — keyed by the existing `settings.profile.kN` slots. */
export interface ProfileOverlay {
  name: string;
  email: string;
  bio: string;
  joined: string;
  lastLogin: string;
  status: string;
}

export function profileOverlay(
  profile: UserProfile | null,
  locale: string,
): ProfileOverlay | null {
  if (!profile) return null;
  return {
    name: profile.displayName,
    email: profile.email,
    bio: pickLocale(profile.bio, locale),
    joined: profile.createdAt.slice(0, 10),
    lastLogin: profile.lastLoginAt ? profile.lastLoginAt.slice(0, 10) : "—",
    status: profile.status,
  };
}
