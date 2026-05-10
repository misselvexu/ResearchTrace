/**
 * Sources page — live overlay module.
 *
 * Wires the 14-row editorial scaffold to the live /sources MSW endpoints:
 * list, create, update (toggle enabled), delete, test, sync, plus the
 * connector catalog used by the "+ Add" picker.
 */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-api-error";
import {
  invalidate,
  sourcesCatalogQuery,
  sourcesQuery,
} from "@/lib/queries";
import { toast } from "@/components/providers/toast";
import type {
  CatalogResponse,
  CreateSourceRequest,
  LocalizedText,
  Source,
  SourceKind,
  SyncSourceResponse,
  TestSourceResponse,
  UpdateSourceRequest,
} from "@/types/api";

// ---------------------------------------------------------------------------
// i18n util
// ---------------------------------------------------------------------------

export function pickLocale(
  text: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!text) return "";
  if (locale === "en") return text.en || text.zh || "";
  return text.zh || text.en || "";
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`;
  return `${Math.floor(ms / 86_400_000)}d`;
}

// ---------------------------------------------------------------------------
// Combined live state
// ---------------------------------------------------------------------------

export interface SourcesLive {
  items: Source[];
  catalog: CatalogResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSourcesLive(): SourcesLive {
  const [items, setItems] = useState<Source[]>([]);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([sourcesQuery({ limit: 50 }), sourcesCatalogQuery()])
      .then(([sR, cR]) => {
        if (cancelled) return;
        if (sR.status === "fulfilled") setItems(sR.value.items);
        if (cR.status === "fulfilled") setCatalog(cR.value);
        const failedAll =
          sR.status === "rejected" && cR.status === "rejected";
        setError(failedAll ? "Failed to load sources" : null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    items,
    catalog,
    loading,
    error,
    refresh: () => {
      invalidate(["sources.list", "sources.catalog"]);
      setTick((n) => n + 1);
    },
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

type T = (key: string) => string;

export async function toggleSourceEnabled(
  s: Source,
  t: T,
): Promise<Source | null> {
  try {
    const next = await api.patch<Source, UpdateSourceRequest>(
      `/sources/${s.id}`,
      { enabled: !s.enabled },
    );
    invalidate(["sources.list"]);
    toast.success(
      next.enabled ? t("sources.alert.resumed") : t("sources.alert.paused"),
    );
    return next;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function renameSource(
  s: Source,
  newName: string,
  t: T,
): Promise<Source | null> {
  if (!newName.trim()) return null;
  try {
    const next = await api.patch<Source, UpdateSourceRequest>(
      `/sources/${s.id}`,
      {
        name: { zh: newName.trim(), en: newName.trim() },
      },
    );
    invalidate(["sources.list"]);
    toast.success(t("sources.alert.edited"));
    return next;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function deleteSource(id: string, t: T): Promise<boolean> {
  try {
    await api.delete<null>(`/sources/${id}`);
    invalidate(["sources.list"]);
    toast.success(t("sources.alert.removed"));
    return true;
  } catch (err) {
    handleApiError(err, t);
    return false;
  }
}

export async function testSource(
  id: string,
  t: T,
): Promise<TestSourceResponse | null> {
  try {
    const res = await api.post<TestSourceResponse, Record<string, never>>(
      `/sources/${id}/test`,
      {},
    );
    if (res.ok) {
      toast.success(
        `${t("sources.alert.testOk")} · ${res.latencyMs}ms · ${res.sampleCount} ✓`,
      );
    } else {
      toast.error(t("sources.alert.testFailed"));
    }
    return res;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function syncSource(
  id: string,
  t: T,
): Promise<SyncSourceResponse | null> {
  try {
    const res = await api.post<SyncSourceResponse, Record<string, never>>(
      `/sources/${id}/sync`,
      {},
    );
    invalidate(["sources.list"]);
    toast.success(t("sources.alert.synced"));
    return res;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function addSourceFromCatalog(
  kind: SourceKind,
  displayName: string,
  t: T,
): Promise<Source | null> {
  // Build a minimal-but-valid SourceConfig for each kind.
  const config: CreateSourceRequest["config"] = (() => {
    switch (kind) {
      case "arxiv":
        return { kind: "arxiv", categories: ["cs.CL"] };
      case "rss":
        return { kind: "rss", feedUrl: "https://example.com/feed.xml" };
      case "github":
        return { kind: "github", repo: "openai/whisper", events: ["releases"] };
      case "openreview":
        return { kind: "openreview", venueId: "NeurIPS.cc/2024" };
      case "hackernews":
        return { kind: "hackernews", minScore: 100 };
      case "semantic_scholar":
        return { kind: "semantic_scholar", query: "" };
      case "pubmed":
        return { kind: "pubmed", query: "" };
      case "biorxiv":
        return { kind: "biorxiv", subject: "neuroscience" };
      case "twitter":
        return { kind: "twitter", handles: [] };
      case "youtube":
        return { kind: "youtube", channelIds: [] };
      case "podcast":
        return { kind: "podcast", feedUrl: "https://example.com/podcast.xml" };
      case "newsletter":
        return { kind: "newsletter", email: "demo@example.com" };
      case "custom_webhook":
        return { kind: "custom_webhook", webhookUrl: "https://example.com/hook" };
    }
  })();

  try {
    const created = await api.post<Source, CreateSourceRequest>("/sources", {
      kind,
      name: { zh: displayName, en: displayName },
      config,
      enabled: true,
    });
    invalidate(["sources.list"]);
    toast.success(t("sources.alert.added"));
    return created;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

// ---------------------------------------------------------------------------
// View-model helpers
// ---------------------------------------------------------------------------

/** Map backend SourceKind → editorial type column (RSS/EMAIL/API/EXT/MANUAL). */
export type LegacyType = "RSS" | "EMAIL" | "API" | "EXT" | "MANUAL";

export function kindToLegacyType(kind: SourceKind): LegacyType {
  switch (kind) {
    case "rss":
    case "podcast":
      return "RSS";
    case "newsletter":
      return "EMAIL";
    case "arxiv":
    case "openreview":
    case "github":
    case "semantic_scholar":
    case "pubmed":
    case "biorxiv":
    case "hackernews":
      return "API";
    case "twitter":
    case "youtube":
      return "EXT";
    case "custom_webhook":
      return "MANUAL";
  }
}

export type LegacyStatus = "active" | "paused" | "error";

export function liveStatusToLegacy(s: Source): LegacyStatus {
  if (!s.enabled) return "paused";
  if (s.status === "error") return "error";
  if (s.status === "rate_limited") return "error";
  if (s.status === "disconnected") return "paused";
  return "active";
}

export interface LiveSourceRow {
  id: string;
  k: string; // editorial-style index used as React key
  type: LegacyType;
  status: LegacyStatus;
  items: number;
  lastFetch: string;
  name: string;
  src: string;
  enabled: boolean;
  raw: Source;
}

export function liveRowsFromSources(
  items: Source[],
  locale: string,
): LiveSourceRow[] {
  return items.map((s, i) => ({
    id: s.id,
    k: String(i + 1),
    type: kindToLegacyType(s.kind),
    status: liveStatusToLegacy(s),
    items: s.recentItemCount,
    lastFetch: relativeTime(s.lastSyncedAt),
    name: pickLocale(s.name, locale),
    src: s.kind,
    enabled: s.enabled,
    raw: s,
  }));
}

export interface SourcesStats {
  total: number;
  active: number;
  paused: number;
  error: number;
  todayItems: number;
}

export function statsFromSources(items: Source[]): SourcesStats {
  let active = 0, paused = 0, error = 0, today = 0;
  for (const s of items) {
    const st = liveStatusToLegacy(s);
    if (st === "active") active++;
    else if (st === "paused") paused++;
    else error++;
    today += s.recentItemCount;
  }
  return { total: items.length, active, paused, error, todayItems: today };
}

// ---------------------------------------------------------------------------
// Import / Export (JSON snapshot)
// ---------------------------------------------------------------------------

export function exportSourcesJSON(items: Source[], t: T): void {
  if (typeof window === "undefined") return;
  try {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `researchtrace-sources-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(t("sources.alert.exported"));
  } catch {
    toast.error(t("sources.alert.exportFailed"));
  }
}

/** Trigger native file picker → import an OPML/JSON snapshot (best-effort). */
export async function importSourcesJSON(
  file: File,
  t: T,
): Promise<number> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const list: Source[] = Array.isArray(parsed) ? parsed : [];
    let added = 0;
    for (const s of list) {
      const ok = await addSourceFromCatalog(
        s.kind,
        pickLocale(s.name, "en") || s.kind,
        t,
      );
      if (ok) added++;
    }
    if (added) toast.success(`${t("sources.alert.imported")} ${added}`);
    return added;
  } catch {
    toast.error(t("sources.alert.importFailed"));
    return 0;
  }
}
