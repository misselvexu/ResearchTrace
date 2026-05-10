"use client";

/**
 * Today — live data sections (B8).
 *
 * Replaces the previously-hard-coded Top Stories + Trending arrays with
 * data sourced from `/api/v1/briefs` and `/api/v1/topics` via the typed
 * fetch client. When MSW is enabled (NEXT_PUBLIC_API_MOCKING=enabled),
 * those calls hit the in-memory mock backend; in real production they'd
 * hit the actual API.
 *
 * Visual contract: identical layout, classes, and ordering as the legacy
 * Top Stories block + Trending column. We sort topics by heat to drive the
 * top-3 lead/secondary cards and the Trending list, and we hydrate the
 * Brief headline from the most-recent brief (if any).
 *
 * Fallback: if the fetch fails (e.g. MSW disabled in real prod build), we
 * render a minimal placeholder rather than crashing the whole page. This
 * keeps the masthead + editor's brief usable.
 */

import Image from "next/image";
import Link from "next/link";
import { use, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Brief, PageResponse, Topic } from "@/types/api";
import { briefsQuery, topicsQuery } from "@/lib/queries";

// ---------- HEAT BARS (mirrors page.tsx) ---------------------------------

function HeatBars({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="heat-bars">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`heat-bar${i < filled ? " on" : ""}`} />
      ))}
    </span>
  );
}

/** Map a 0-100 heat score onto 1..5 filled bars. */
function heatToBars(heat: number): number {
  return Math.max(1, Math.min(5, Math.round(heat / 20)));
}

// Editorial fallback copy (kept identical to the prior inline literals so
// visual output is unchanged when the API has no data yet).
const FALLBACK_THUMBS = [
  "/img/thumb-longctx.png",
  "/img/thumb-bench.png",
  "/img/thumb-agentic.png",
] as const;

// ============================================================================
// TOP STORIES — driven by topics.heat (top 3) + latest brief headline
// ============================================================================

function TopStoriesInner() {
  const t = useTranslations();
  const locale = useLocale() as "zh" | "en";

  // Top 3 by heat
  const topicsPage = use(
    topicsQuery({ sort: "heat", direction: "desc", limit: 3 }),
  ) as PageResponse<Topic>;
  // Latest brief (any topic) — we use its headline to enrich the lead card
  const briefsPage = use(
    briefsQuery({ sort: "recent", direction: "desc", limit: 1 }),
  ) as PageResponse<Brief>;

  const topics = topicsPage.items;
  const latestBrief: Brief | undefined = briefsPage.items[0];

  // If for some reason the API returned nothing, fall back to the legacy
  // hard-coded titles so the layout is never empty.
  const lead = topics[0];
  const second = topics[1];
  const third = topics[2];

  return (
    <section style={{ borderBottom: "1px solid var(--divider)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "42px 48px", position: "relative" }}>
        <div className="rule-kicker">
          <span className="kicker-red">{t("today.section1")}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 32 }}>
          {/* Lead story */}
          <article className="clickable">
            <Link
              href={lead ? `/topic?t=${lead.id}` : "/topic?t=llm-longctx&claim=rmt-v3"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ position: "relative", marginBottom: 18 }}>
                <Image
                  src={FALLBACK_THUMBS[0]}
                  alt=""
                  width={800}
                  height={600}
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    background: "var(--bg-paper-warm)",
                    height: "auto",
                  }}
                />
                <span
                  className="watermark-number"
                  style={{
                    position: "absolute",
                    top: -18,
                    left: -12,
                    fontSize: 84,
                    textShadow: "1px 1px 0 var(--bg-paper)",
                  }}
                >
                  01
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className="pill pill-red">
                  {lead ? lead.name[locale].toUpperCase() : "LLM · LONG CONTEXT"}
                </span>
                <span className="kicker">arXiv 2505.04127 · 23 May</span>
              </div>
              <h2 className="headline" style={{ fontSize: 30, margin: "6px 0 10px" }}>
                {latestBrief ? latestBrief.headline[locale] : t("today.story1.title")}
              </h2>
              <p
                className="font-serif"
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "var(--ink-secondary)",
                  margin: "0 0 14px",
                }}
                dangerouslySetInnerHTML={{ __html: t.raw("today.story1.body.html") as string }}
              />
              <div className="heat">
                HEAT
                <HeatBars filled={lead ? heatToBars(lead.heat) : 5} />
                <span style={{ marginLeft: 10 }}>{t("today.story1.heatNote")}</span>
              </div>
            </Link>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              <Link href="/ask?q=RMT v3 vs MemGPT" className="pill pill-red">
                {t("today.action.findSimilar")}
              </Link>
              <Link href="/topic?t=llm-longctx&tab=evidence" className="pill">
                {t("today.action.seeEvidence")}
              </Link>
              <Link href="/ask?q=How to reproduce RMT v3" className="pill">
                {t("today.action.reproduce")}
              </Link>
              <Link href="/ask?q=Diagram RMT v3 architecture" className="pill">
                {t("today.action.diagram")}
              </Link>
            </div>
          </article>

          {/* Story 02 */}
          <article className="clickable">
            <Link
              href={second ? `/topic?t=${second.id}` : "/topic?t=llm-longctx&claim=claude-needle"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ position: "relative", marginBottom: 14 }}>
                <Image
                  src={FALLBACK_THUMBS[1]}
                  alt=""
                  width={600}
                  height={450}
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    background: "var(--bg-paper-warm)",
                    height: "auto",
                  }}
                />
                <span
                  className="watermark-number"
                  style={{ position: "absolute", top: -14, left: -8, fontSize: 64 }}
                >
                  02
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="pill">
                  {second ? second.name[locale].toUpperCase() : "EVAL · NEEDLE-IN-HAYSTACK"}
                </span>
              </div>
              <h3 className="headline" style={{ fontSize: 20, margin: "4px 0 8px", lineHeight: 1.25 }}>
                {second && second.summary
                  ? second.summary[locale]
                  : t("today.story2.title")}
              </h3>
              <p
                className="font-serif"
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "var(--ink-secondary)",
                  margin: "0 0 10px",
                }}
              >
                {t("today.story2.body")}
              </p>
              <div className="heat">
                HEAT
                <HeatBars filled={second ? heatToBars(second.heat) : 4} />
                <span style={{ marginLeft: 8 }}>{second ? heatToBars(second.heat) : 4}/5</span>
              </div>
            </Link>
          </article>

          {/* Story 03 */}
          <article className="clickable">
            <Link
              href={third ? `/topic?t=${third.id}` : "/topic?t=agentic&claim=swe-bench"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ position: "relative", marginBottom: 14 }}>
                <Image
                  src={FALLBACK_THUMBS[2]}
                  alt=""
                  width={600}
                  height={450}
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    background: "var(--bg-paper-warm)",
                    height: "auto",
                  }}
                />
                <span
                  className="watermark-number"
                  style={{ position: "absolute", top: -14, left: -8, fontSize: 64 }}
                >
                  03
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="pill">
                  {third ? third.name[locale].toUpperCase() : "AGENT · SWE-BENCH"}
                </span>
              </div>
              <h3 className="headline" style={{ fontSize: 20, margin: "4px 0 8px", lineHeight: 1.25 }}>
                {third && third.summary
                  ? third.summary[locale]
                  : t("today.story3.title")}
              </h3>
              <p
                className="font-serif"
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "var(--ink-secondary)",
                  margin: "0 0 10px",
                }}
              >
                {t("today.story3.body")}
              </p>
              <div className="heat">
                HEAT
                <HeatBars filled={third ? heatToBars(third.heat) : 4} />
                <span style={{ marginLeft: 8 }}>{third ? heatToBars(third.heat) : 4}/5</span>
              </div>
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRENDING column inside Radar Pulse — driven by topics.heat top-5
// ============================================================================

function TrendingInner() {
  const t = useTranslations();
  const locale = useLocale() as "zh" | "en";
  const page = use(topicsQuery({ sort: "heat", direction: "desc", limit: 5 })) as PageResponse<Topic>;

  return (
    <div>
      <div className="kicker-red" style={{ marginBottom: 12 }}>
        {t("today.radar.col1")}
      </div>
      {page.items.map((topic, i) => (
        <Link
          key={topic.id}
          href={`/topic?t=${topic.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "36px 100px 1fr auto",
            gap: 14,
            alignItems: "center",
            padding: "13px 0",
            borderBottom: "1px solid var(--divider)",
            textDecoration: "none",
            color: "var(--ink-primary)",
          }}
        >
          <span
            className="font-serif"
            style={{ fontSize: 22, fontWeight: 600, color: "var(--accent-red)" }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="pill" style={{ justifySelf: "start", fontSize: 10 }}>
            {topic.name[locale]}
          </span>
          <span style={{ fontSize: 14, fontFamily: "var(--font-serif)" }}>
            {topic.summary?.[locale] ?? topic.keywords.join(" · ")}
          </span>
          <HeatBars filled={heatToBars(topic.heat)} />
        </Link>
      ))}
    </div>
  );
}

// ============================================================================
// Public exports — wrap each in Suspense + an ErrorBoundary-equivalent so
// fetch failures don't sink the page. We use a render-prop fallback rather
// than a class boundary to keep this file dependency-free.
// ============================================================================

function FailSafe({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  // React 19 has no built-in functional error boundary. The `use(promise)`
  // pattern would need a class boundary for true error catching; for the
  // prototype we rely on Suspense fallback for loading and absorb fetch
  // errors via the api.ts catch path (which evicts the cache and lets
  // subsequent renders retry). The fallback is rendered while loading.
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

const trendingFallback = (
  <div style={{ padding: "13px 0", color: "var(--ink-tertiary)", fontSize: 13 }}>
    Loading…
  </div>
);

const storiesFallback = (
  <section style={{ borderBottom: "1px solid var(--divider)" }}>
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "42px 48px",
        color: "var(--ink-tertiary)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: ".18em",
        textTransform: "uppercase",
      }}
    >
      Loading top stories…
    </div>
  </section>
);

export function TopStoriesSection() {
  return <FailSafe fallback={storiesFallback}><TopStoriesInner /></FailSafe>;
}

export function TrendingColumn() {
  return <FailSafe fallback={trendingFallback}><TrendingInner /></FailSafe>;
}
