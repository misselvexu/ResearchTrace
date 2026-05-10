"use client";

/**
 * Brief detail — live data overlay + mutations.
 *
 * The page's editorial body (TOC, §1-§6 prose, follow-ups) is copywriter-owned
 * and lives in i18n keys. This module overlays only the metadata that the API
 * authoritatively owns:
 *   - status badge      (queued / running / ready / failed)
 *   - reading time      (`readingTimeMin`)
 *   - cadence pill      (daily / weekly / monthly / ad_hoc)
 *   - feedback counts   (upvotes / downvotes / myVote)
 *   - savedToVault flag
 *   - shareToken state
 *
 * Mutations (`save`, `share`, `feedback`) call the existing mock endpoints
 * and surface the result via toast. Errors flow through `handleApiError`.
 *
 * Failure mode: silently fall back to "ready" status with no extra metadata
 * (the editorial body is already a complete page).
 */

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { briefQuery, invalidate } from "@/lib/queries";
import { handleApiError } from "@/lib/handle-api-error";
import { toast } from "@/components/providers/toast";
import type {
  Brief,
  BriefFeedbackRequest,
  BriefFeedbackResponse,
  ShareBriefResponse,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Hook — load + cache the brief
// ---------------------------------------------------------------------------

export interface BriefLive {
  brief: Brief | null;
  loading: boolean;
}

const EMPTY: BriefLive = { brief: null, loading: true };

/**
 * Page id (route param like `127`) doesn't match the seed id (`b_001`).
 * We try the raw param first, then fall back to `b_001` so the page renders
 * something live in mock mode. In production both will succeed because the
 * real backend stores under the canonical id.
 */
export function useBriefLive(rawId: string): BriefLive {
  const [state, setState] = useState<BriefLive>(EMPTY);

  useEffect(() => {
    let alive = true;
    const tryIds = Array.from(new Set([rawId, `b_${rawId.padStart(3, "0")}`, "b_001"]));

    (async () => {
      for (const id of tryIds) {
        try {
          const b = await briefQuery(id);
          if (!alive) return;
          setState({ brief: b, loading: false });
          return;
        } catch {
          // try next candidate
        }
      }
      if (alive) setState({ brief: null, loading: false });
    })();

    return () => {
      alive = false;
    };
  }, [rawId]);

  return state;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function saveBriefToVault(
  brief: Brief | null,
  t: (key: string) => string,
): Promise<boolean> {
  if (!brief) {
    toast(t("brief.alert.save"));
    return false;
  }
  try {
    await api.post<Brief>(`/briefs/${brief.id}/save`);
    invalidate(["briefs"]);
    toast.success(t("brief.alert.save"));
    return true;
  } catch (err) {
    handleApiError(err, t);
    return false;
  }
}

export async function shareBrief(
  brief: Brief | null,
  t: (key: string) => string,
): Promise<string | null> {
  if (!brief) {
    toast(t("brief.alert.share"));
    return null;
  }
  try {
    const res = await api.post<ShareBriefResponse>(`/briefs/${brief.id}/share`);
    invalidate(["briefs"]);
    toast.success(t("brief.alert.share"));
    return res.shareUrl;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function voteBrief(
  brief: Brief | null,
  vote: "up" | "down" | null,
  t: (key: string) => string,
): Promise<BriefFeedbackResponse | null> {
  if (!brief) return null;
  try {
    const res = await api.post<BriefFeedbackResponse, BriefFeedbackRequest>(
      `/briefs/${brief.id}/feedback`,
      { vote },
    );
    invalidate(["briefs"]);
    return res;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Small presenter — status pill keyed by Brief.status
// ---------------------------------------------------------------------------

export function BriefStatusPill({ status }: { status: Brief["status"] | null }) {
  if (!status) return null;
  const colorMap: Record<Brief["status"], string> = {
    queued: "var(--ink-tertiary)",
    running: "var(--warning-amber)",
    ready: "var(--success-green)",
    failed: "var(--accent-red)",
  };
  const labelMap: Record<Brief["status"], string> = {
    queued: "QUEUED",
    running: "RUNNING",
    ready: "READY",
    failed: "FAILED",
  };
  return (
    <span
      className="pill"
      style={{
        fontSize: 9,
        color: colorMap[status],
        borderColor: "currentColor",
      }}
    >
      {labelMap[status]}
    </span>
  );
}

/**
 * BriefMeta — the small inline strip beneath the title:
 *   "READY · 6 min · weekly · Saved to Vault"
 *
 * Renders nothing while loading; degrades gracefully when no live data.
 */
export function BriefMeta({ brief }: { brief: Brief | null }) {
  if (!brief) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <BriefStatusPill status={brief.status} />
      <span className="kicker">·</span>
      <span className="kicker">{brief.readingTimeMin} min</span>
      <span className="kicker">·</span>
      <span className="kicker">{brief.cadence}</span>
      {brief.savedToVault && (
        <>
          <span className="kicker">·</span>
          <span className="pill pill-red" style={{ fontSize: 9 }}>
            ✓ VAULT
          </span>
        </>
      )}
    </span>
  );
}
