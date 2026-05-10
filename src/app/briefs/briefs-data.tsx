"use client";

/**
 * Briefs page — live data overlay + new-brief mutation.
 *
 * The editorial scaffold (`BRIEFS` + `FEATURED` in page.tsx) preserves
 * copywriter-owned headlines (`briefs.b127.title`, `briefs.b126.title`...).
 * This module exposes:
 *
 *   - `useBriefsLive()`   — calls `briefsQuery({sort:"recent"})` once,
 *                           returns total + raw items for stats overlay.
 *   - `requestNewBrief()` — POSTs to `/briefs` for a topicId, invalidates
 *                           the briefs cache, surfaces success/error toast.
 */

import { useEffect, useState } from "react";
import { briefsQuery, invalidate } from "@/lib/queries";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-api-error";
import { toast } from "@/components/providers/toast";
import type { Brief, CreateBriefRequest, TopicId } from "@/types/api";

export interface BriefsLive {
  total: number;
  briefs: Brief[];
  loading: boolean;
}

const EMPTY: BriefsLive = { total: 0, briefs: [], loading: true };

export function useBriefsLive(): BriefsLive {
  const [state, setState] = useState<BriefsLive>(EMPTY);

  useEffect(() => {
    let alive = true;
    briefsQuery({ sort: "recent", limit: 12 })
      .then((page) => {
        if (!alive) return;
        setState({
          total: page.totalEstimate,
          briefs: page.items,
          loading: false,
        });
      })
      .catch(() => {
        if (!alive) return;
        setState({ total: 0, briefs: [], loading: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

/**
 * POST /briefs to ask the backend to schedule a new brief for the given
 * topic. Surfaces success/error toasts. Returns true on success.
 */
export async function requestNewBrief(
  topicId: TopicId | string,
  t: (key: string) => string,
): Promise<boolean> {
  try {
    await api.post<Brief, CreateBriefRequest>("/briefs", {
      topicId: topicId as TopicId,
    });
    invalidate(["briefs"]);
    toast.success(t("briefs.alert.newBrief"));
    return true;
  } catch (err) {
    handleApiError(err, t);
    return false;
  }
}
