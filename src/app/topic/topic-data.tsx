"use client";

/**
 * Topic detail — live data overlay.
 *
 * The page's editorial scaffolding (`TOPIC_DATA` enum keyed by `llm-longctx |
 * agentic | eval | rag | pm | alignment`) carries copywriter-owned descriptions
 * and stat numbers. The backend has its own topic registry with ids `t_001..
 * t_006`. To bridge:
 *
 *   - `useTopicLive(slug)` calls `topicQuery(seedId)` + `topicStatsQuery(seedId)`
 *     where seedId is mapped by **position** from the slug enum (1st slug →
 *     `t_001`, 2nd → `t_002`, etc.). Editorial `name`, `zh`, `desc` are
 *     preserved; only the stat numbers + heat sparkline come from live data.
 *
 * Failure mode: silently fall back to the editorial seed values.
 */

import { useEffect, useState } from "react";
import { topicQuery, topicStatsQuery } from "@/lib/queries";
import type { Topic, TopicStats } from "@/types/api";

// Position-based slug → seed-id map (matches the order of the page's
// `TOPIC_DATA` keys and SEED_TOPICS array order).
const SLUG_TO_SEED: Record<string, string> = {
  "llm-longctx": "t_001",
  agentic: "t_002",
  eval: "t_003",
  rag: "t_004",
  pm: "t_005",
  alignment: "t_006",
};

export interface TopicLive {
  topic: Topic | null;
  stats: TopicStats | null;
  loading: boolean;
}

const EMPTY: TopicLive = { topic: null, stats: null, loading: true };

export function useTopicLive(slug: string): TopicLive {
  const [state, setState] = useState<TopicLive>(EMPTY);

  useEffect(() => {
    let alive = true;
    const seedId = SLUG_TO_SEED[slug] ?? "t_001";

    Promise.allSettled([topicQuery(seedId), topicStatsQuery(seedId)])
      .then((results) => {
        if (!alive) return;
        const [topicRes, statsRes] = results;
        setState({
          topic: topicRes.status === "fulfilled" ? topicRes.value : null,
          stats: statsRes.status === "fulfilled" ? statsRes.value : null,
          loading: false,
        });
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  return state;
}

/**
 * Sparkline — small SVG chart for the topic's 7-day heat series.
 *
 * Renders nothing when no stats data is available; otherwise draws a
 * normalized polyline (0..1 → top..bottom) inside a fixed viewBox.
 */
export function HeatSparkline({
  stats,
  width = 110,
  height = 28,
}: {
  stats: TopicStats | null;
  width?: number;
  height?: number;
}) {
  if (!stats || stats.heatSeries.length === 0) return null;

  const series = stats.heatSeries;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;

  const stepX = width / Math.max(series.length - 1, 1);
  const points = series
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-label={`7-day heat trend, peak ${max}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent-red)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Format an ISO timestamp as a "x ago" relative string.
 * Lightweight — no Intl.RelativeTimeFormat dependency to keep bundle slim.
 */
export function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}
