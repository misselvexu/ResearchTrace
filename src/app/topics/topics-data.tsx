"use client";

/**
 * Topics page — live data overlay.
 *
 * The editorial scaffold (`TOPIC_ROWS` in page.tsx) uses copywriter-owned
 * names + i18n keys (`topic.t1.zh`, `topic.t1.desc`). The backend has its
 * own topic registry with different ids. To bridge, this hook calls
 * `topicsQuery({ sort: "heat", limit: 12 })` and lets the page consume
 * either:
 *   - the **live heat overlay** keyed by position (the i-th editorial row
 *     gets heat from the i-th live topic, falling back to the seed); or
 *   - a **summary** for the masthead watermark / total count.
 *
 * Failure mode: silently fall back to seed values (the editorial copy
 * is already a complete page).
 */

import { useEffect, useState } from "react";
import { topicsQuery } from "@/lib/queries";
import type { Topic } from "@/types/api";

export interface TopicsLive {
  /** Total topics reported by the API. */
  total: number;
  /** Live topics sorted by heat desc — used to overlay editorial rows. */
  topics: Topic[];
  /** True until the first response (or failure) lands. */
  loading: boolean;
}

const EMPTY: TopicsLive = { total: 0, topics: [], loading: true };

export function useTopicsLive(limit = 12): TopicsLive {
  const [state, setState] = useState<TopicsLive>(EMPTY);

  useEffect(() => {
    let alive = true;
    topicsQuery({ sort: "heat", limit })
      .then((page) => {
        if (!alive) return;
        setState({
          total: page.totalEstimate,
          topics: page.items,
          loading: false,
        });
      })
      .catch(() => {
        if (!alive) return;
        // Silent fallback — editorial seed is the source of truth.
        setState({ total: 0, topics: [], loading: false });
      });
    return () => {
      alive = false;
    };
  }, [limit]);

  return state;
}

/**
 * Map a 0-100 backend heat score to a 1-5 bar count for the existing
 * `<HeatBars heat>` component. Anything ≥80 is 5 bars; ≥60 → 4; ≥40 → 3;
 * ≥20 → 2; otherwise 1.
 */
export function heatBars(heat: number): number {
  if (heat >= 80) return 5;
  if (heat >= 60) return 4;
  if (heat >= 40) return 3;
  if (heat >= 20) return 2;
  return 1;
}
