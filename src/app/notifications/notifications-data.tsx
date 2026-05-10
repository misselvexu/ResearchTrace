/**
 * Notifications page — live overlay module.
 *
 * Wires the editorial 12-row notifications scaffold to the live MSW endpoints:
 * list (with filter), mark-read (single + all), and delete.
 */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-api-error";
import { invalidate, notificationsListQuery } from "@/lib/queries";
import { toast } from "@/components/providers/toast";
import type {
  ListNotificationsQuery,
  LocalizedText,
  Notification,
  NotificationKind,
} from "@/types/api";

// ---------------------------------------------------------------------------
// i18n helpers
// ---------------------------------------------------------------------------

export function pickLocale(
  text: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!text) return "";
  if (locale === "en") return text.en || text.zh || "";
  return text.zh || text.en || "";
}

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`;
  if (ms < 7 * 86_400_000) return `${Math.floor(ms / 86_400_000)}d`;
  return iso.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Live state
// ---------------------------------------------------------------------------

export interface NotificationsLive {
  items: Notification[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useNotificationsLive(
  q: ListNotificationsQuery = { limit: 50 },
): NotificationsLive {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Stable JSON of the query parts so the effect re-runs only on real change.
  const qKey = JSON.stringify(q);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    notificationsListQuery(q)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load notifications");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qKey, tick]);

  return {
    items,
    loading,
    error,
    refresh: () => {
      invalidate(["notifications"]);
      setTick((n) => n + 1);
    },
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

type T = (key: string) => string;

export async function markNotificationRead(
  id: string,
  t: T,
): Promise<boolean> {
  try {
    await api.post(`/notifications/${id}/read`);
    invalidate(["notifications"]);
    return true;
  } catch (err) {
    handleApiError(err, t);
    return false;
  }
}

export async function markAllNotificationsRead(t: T): Promise<boolean> {
  try {
    await api.post("/notifications/read-all");
    invalidate(["notifications"]);
    toast.success(t("notifications.alert.markAllDone"));
    return true;
  } catch (err) {
    handleApiError(err, t);
    return false;
  }
}

export async function deleteNotification(
  id: string,
  t: T,
): Promise<boolean> {
  try {
    await api.delete<null>(`/notifications/${id}`);
    invalidate(["notifications"]);
    toast.success(t("notifications.alert.deleted"));
    return true;
  } catch (err) {
    handleApiError(err, t);
    return false;
  }
}

// ---------------------------------------------------------------------------
// View-model: map live Notification → editorial scaffold
// ---------------------------------------------------------------------------

export type LegacySection = "today" | "yesterday" | "earlier";
export type LegacyKind = "alert" | "digest" | "mention" | "system" | "ingest";
export type LegacyActor =
  | "radar"
  | "reporter"
  | "ingestor"
  | "curator"
  | "system"
  | "billing";

export function kindToLegacyKind(kind: NotificationKind): LegacyKind {
  switch (kind) {
    case "topic_heat_spike":
    case "source_error":
    case "agent_failed":
      return "alert";
    case "brief_ready":
      return "digest";
    case "agent_finished":
      return "ingest";
    case "billing_invoice":
    case "billing_payment_failed":
    case "billing_trial_ending":
    case "account_security":
    case "system_announcement":
      return "system";
    default:
      return "system";
  }
}

export function kindToLegacyActor(kind: NotificationKind): LegacyActor {
  switch (kind) {
    case "topic_heat_spike":
      return "radar";
    case "brief_ready":
      return "reporter";
    case "source_error":
    case "agent_finished":
      return "ingestor";
    case "agent_failed":
      return "curator";
    case "billing_invoice":
    case "billing_payment_failed":
    case "billing_trial_ending":
      return "billing";
    case "account_security":
    case "system_announcement":
    default:
      return "system";
  }
}

export function bucketSection(iso: string): LegacySection {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 86_400_000) return "today";
  if (ms < 2 * 86_400_000) return "yesterday";
  return "earlier";
}

export interface LiveNotifRow {
  id: string;
  k: string;
  section: LegacySection;
  kind: LegacyKind;
  actor: LegacyActor;
  unread: boolean;
  title: string;
  body: string;
  time: string;
  href: string;
  raw: Notification;
}

export function liveNotifRows(
  items: Notification[],
  locale: string,
): LiveNotifRow[] {
  return items.map((n, i) => ({
    id: n.id,
    k: String(i + 1),
    section: bucketSection(n.createdAt),
    kind: kindToLegacyKind(n.kind),
    actor: kindToLegacyActor(n.kind),
    unread: !n.read,
    title: pickLocale(n.title, locale),
    body: pickLocale(n.body, locale),
    time: relativeTime(n.createdAt),
    href: n.actionUrl || "/notifications",
    raw: n,
  }));
}

export interface NotifStats {
  unread: number;
  today: number;
  mentions: number;
  system: number;
  digest: number;
}

export function statsFromNotifs(items: Notification[]): NotifStats {
  let unread = 0,
    today = 0,
    mentions = 0,
    system = 0,
    digest = 0;
  for (const n of items) {
    if (!n.read) unread++;
    if (bucketSection(n.createdAt) === "today") today++;
    const k = kindToLegacyKind(n.kind);
    if (k === "mention") mentions++;
    else if (k === "system") system++;
    else if (k === "digest") digest++;
  }
  return { unread, today, mentions, system, digest };
}
