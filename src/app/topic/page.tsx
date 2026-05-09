"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";

type TopicId = "llm-longctx" | "agentic" | "eval" | "rag" | "pm" | "alignment";
type TabId = "overview" | "sources" | "claims" | "evidence" | "radar" | "briefs";

type TopicEntry = {
  name: string;
  k: string;
  n: string;
  img: string;
  items: number;
  claims: number;
  evidence: number;
  briefs: number;
  sourceCount: number;
  navId: string;
};

const TOPIC_DATA: Record<TopicId, TopicEntry> = {
  "llm-longctx": { name: "LLM Long Context", k: "t1", n: "01", img: "thumb-longctx.png", items: 147, claims: 38, evidence: 412, briefs: 8, sourceCount: 67, navId: "topic-llm" },
  "agentic": { name: "Agentic Workflows", k: "t2", n: "02", img: "thumb-agentic.png", items: 89, claims: 24, evidence: 213, briefs: 5, sourceCount: 42, navId: "topic-agent" },
  "eval": { name: "AI Evaluation", k: "t3", n: "03", img: "thumb-bench.png", items: 62, claims: 19, evidence: 141, briefs: 4, sourceCount: 31, navId: "topic-eval" },
  "rag": { name: "RAG & Memory", k: "t4", n: "04", img: "thumb-rag.png", items: 104, claims: 31, evidence: 298, briefs: 6, sourceCount: 48, navId: "topic-rag" },
  "pm": { name: "AI Product Strategy", k: "t5", n: "05", img: "thumb-strategy.png", items: 78, claims: 22, evidence: 167, briefs: 7, sourceCount: 36, navId: "topic-pm" },
  "alignment": { name: "Alignment & Safety", k: "t6", n: "06", img: "thumb-align.png", items: 43, claims: 14, evidence: 96, briefs: 3, sourceCount: 22, navId: "" },
};

const TABS: { id: TabId; labelK: string; en: string }[] = [
  { id: "overview", labelK: "topic.tab.overview", en: "Overview" },
  { id: "sources", labelK: "topic.tab.sources", en: "Sources" },
  { id: "claims", labelK: "topic.tab.claims", en: "Claims" },
  { id: "evidence", labelK: "topic.tab.evidence", en: "Evidence" },
  { id: "radar", labelK: "topic.tab.radar", en: "Radar" },
  { id: "briefs", labelK: "topic.tab.briefs", en: "Briefs" },
];

function TopicPageInner() {
  const t = useTranslations();
  const sp = useSearchParams();
  const tidRaw = (sp.get("t") ?? "llm-longctx") as TopicId;
  const tid = (tidRaw in TOPIC_DATA ? tidRaw : "llm-longctx") as TopicId;
  const tab = ((sp.get("tab") ?? "overview") as TabId);
  const T = TOPIC_DATA[tid];

  const navId = (T.navId || "topics") as Parameters<typeof AppLayout>[0]["activeId"];

  return (
    <AppLayout
      activeId={navId}
      crumb={`${t("topic.crumbPrefix")}${T.name.toUpperCase()}`}
    >
      {/* Header */}
      <section style={{ borderBottom: "1px solid var(--divider)", background: "var(--bg-paper)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 32, alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                <Link href="/topics" className="kicker" style={{ textDecoration: "none", color: "var(--ink-tertiary)" }}>
                  {t("topic.allTopics")}
                </Link>
                <span className="kicker">·</span>
                <span className="kicker-red">{t("topic.no")}{T.n}</span>
              </div>
              <h1 className="headline" style={{ fontSize: 48, margin: "0 0 4px" }}>{T.name}</h1>
              <div className="font-serif" style={{ fontStyle: "italic", color: "var(--ink-secondary)", fontSize: 17 }}>
                {t(`topic.${T.k}.zh`)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 120 }}>{T.n}</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr) auto",
              gap: 12,
              marginTop: 26,
              paddingTop: 18,
              borderTop: "1px solid var(--divider)",
              alignItems: "center",
            }}
          >
            {([
              ["topic.stat.items", T.items],
              ["topic.stat.claims", T.claims],
              ["topic.stat.evidence", T.evidence],
              ["topic.stat.briefs", T.briefs],
              ["topic.stat.sources", T.sourceCount],
            ] as const).map(([lk, n]) => (
              <div key={lk}>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1 }}>{n}</div>
                <div className="kicker" style={{ fontSize: 10, marginTop: 2 }}>{t(lk)}</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6 }}>
              <button className="pill pill-red" onClick={() => alert(t("topic.alert.pin"))}>{t("topic.btn.pinned")}</button>
              <button className="pill" onClick={() => alert(t("topic.alert.settings"))}>{t("topic.btn.settings")}</button>
            </div>
          </div>

          <nav className="tab-strip" style={{ marginTop: 22 }}>
            {TABS.map((tb) => (
              <Link
                key={tb.id}
                href={`/topic?t=${tid}&tab=${tb.id}`}
                className={tb.id === tab ? "is-active" : ""}
              >
                <span>{tb.en}</span>
                <span style={{ marginLeft: 6, fontSize: 9, color: "var(--ink-tertiary)" }}>{t(tb.labelK)}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 48px 80px" }}>
          {tab === "overview" && <OverviewPanel tid={tid} T={T} />}
          {tab === "sources" && <SourcesPanel />}
          {tab === "claims" && <ClaimsPanel tid={tid} />}
          {tab === "evidence" && <EvidencePanel />}
          {tab === "radar" && <RadarPanel />}
          {tab === "briefs" && <BriefsPanel />}
        </div>
      </section>
    </AppLayout>
  );
}

export default function TopicPage() {
  return (
    <Suspense fallback={null}>
      <TopicPageInner />
    </Suspense>
  );
}

/* ============ OVERVIEW ============ */
function OverviewPanel({ tid, T }: { tid: TopicId; T: TopicEntry }) {
  const t = useTranslations();
  const RADAR = [
    ["arXiv cs.CL", "23"],
    ["GitHub Trending", "8"],
    ["Anthropic Research", "4"],
    ["DeepMind Blog", "3"],
    [t("topic.ov.personalSaves"), "12"],
  ] as const;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48 }}>
      <article>
        <div className="kicker-red">{t("topic.ov.kicker")}</div>
        <h2 className="headline" style={{ fontSize: 34, margin: "14px 0 22px", lineHeight: 1.18 }}>
          {t("topic.ov.h1")}
        </h2>

        <div className="callout-brief" style={{ marginBottom: 28 }}>
          <span className="label">{t("topic.ov.brief.label")}</span>
          <span dangerouslySetInnerHTML={{ __html: t.raw("topic.ov.brief.body.html") as string }} />
        </div>

        <p
          className="font-serif dropcap"
          style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-primary)" }}
          dangerouslySetInnerHTML={{ __html: t.raw("topic.ov.p1.html") as string }}
        />
        <p
          className="font-serif"
          style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-primary)", marginTop: 18 }}
          dangerouslySetInnerHTML={{ __html: t.raw("topic.ov.p2.html") as string }}
        />

        <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 600, margin: "30px 0 12px" }}>
          {t("topic.ov.h3")}
        </h3>
        <ol style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.7, color: "var(--ink-primary)", paddingLeft: 20 }}>
          <li dangerouslySetInnerHTML={{ __html: t.raw("topic.ov.li1.html") as string }} />
          <li dangerouslySetInnerHTML={{ __html: t.raw("topic.ov.li2.html") as string }} />
          <li dangerouslySetInnerHTML={{ __html: t.raw("topic.ov.li3.html") as string }} />
        </ol>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 30, paddingTop: 18, borderTop: "1px solid var(--divider)" }}>
          <Link href={`/ask?q=${encodeURIComponent(t("topic.ov.askDiagram"))}`} className="pill pill-red" style={{ textDecoration: "none" }}>
            {t("topic.ov.btn.diagram")}
          </Link>
          <Link href={`/ask?q=${encodeURIComponent(t("topic.ov.askSimilar"))}`} className="pill" style={{ textDecoration: "none" }}>
            {t("topic.ov.btn.findSimilar")}
          </Link>
          <Link href="/topic?t=llm-longctx&tab=claims" className="pill" style={{ textDecoration: "none" }}>
            {t("topic.ov.btn.allClaims")}
          </Link>
          <button className="pill" onClick={() => alert(t("topic.ov.alert.deepBrief"))}>
            {t("topic.ov.btn.deepBrief")}
          </button>
        </div>

        <figure style={{ margin: "38px 0 0", padding: 24, background: "var(--bg-paper-warm)", border: "1px solid var(--divider)" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", border: "1px solid var(--divider)", background: "#fff" }}>
            <Image src="/img/agents-diagram.png" alt="" fill sizes="100vw" style={{ objectFit: "contain" }} />
          </div>
          <figcaption
            className="font-serif"
            style={{ fontStyle: "italic", fontSize: 13, color: "var(--ink-secondary)", marginTop: 10, textAlign: "center" }}
            dangerouslySetInnerHTML={{ __html: t.raw("topic.ov.fig.html") as string }}
          />
        </figure>
      </article>

      <aside style={{ position: "sticky", top: 88, alignSelf: "start" }}>
        <div style={{ border: "1px solid var(--divider)", background: "var(--bg-card)", padding: "18px 18px 14px" }}>
          <div className="kicker-red" style={{ marginBottom: 10 }}>{t("topic.ov.fact.label")}</div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="leader" style={{ marginBottom: 6 }}>
              <span className="kicker" style={{ fontSize: 10 }}>{t(`topic.ov.fact.k${i}`)}</span>
              <span className="dots" />
              <span className="font-mono" style={{ fontSize: 11 }}>{t(`topic.ov.fact.v${i}`)}</span>
            </div>
          ))}
        </div>

        <div style={{ border: "1px solid var(--divider)", background: "var(--bg-card)", padding: 18, marginTop: 14 }}>
          <div className="kicker-red" style={{ marginBottom: 14 }}>{t("topic.ov.radar")}</div>
          {RADAR.map(([s, n]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-red)" }} />
              <span style={{ fontSize: 13, flex: 1 }}>{s}</span>
              <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-secondary)" }}>{n}</span>
            </div>
          ))}
          <Link
            href={`/topic?t=${tid}&tab=sources`}
            className="link-red font-mono"
            style={{ fontSize: 10, letterSpacing: ".14em" }}
          >
            {t("topic.ov.radar.seeAll")} {T.sourceCount}{t("topic.ov.radar.sources")}
          </Link>
        </div>

        <div style={{ border: "1px solid var(--divider)", background: "var(--bg-paper-warm)", padding: 18, marginTop: 14 }}>
          <div className="kicker-red" style={{ marginBottom: 10 }}>{t("topic.ov.notes")}</div>
          {[
            { num: "#2204", labelK: "topic.ov.note1", border: true },
            { num: "#2156", labelK: "topic.ov.note2", border: true },
            { num: "#2098", labelK: "topic.ov.note3", border: false },
          ].map(({ num, labelK, border }) => (
            <a
              key={num}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert(t("topic.ov.alert.openNote") + num);
              }}
              style={{
                display: "block",
                fontFamily: "var(--font-serif)",
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--ink-primary)",
                textDecoration: "none",
                lineHeight: 1.5,
                borderBottom: border ? "1px solid var(--divider)" : "none",
                padding: "8px 0",
              }}
            >
              {t(labelK)}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ============ SOURCES ============ */
type SourceRow = {
  type: string; year: string; n: string; titleK: string;
  authK?: string; auth?: string; venueK?: string; venue?: string;
  dateK: string; refs: number; evi: number; hot: number; saved?: boolean;
};

const SOURCES: SourceRow[] = [
  { type: "PAPER", year: "2025", n: "01", titleK: "topic.src.s1.title", authK: "topic.src.s1.auth", venue: "arXiv 2505.04127", dateK: "topic.src.d.may7", refs: 23, evi: 18, hot: 5 },
  { type: "PAPER", year: "2025", n: "02", titleK: "topic.src.s2.title", authK: "topic.src.s2.auth", venueK: "topic.src.s2.venue", dateK: "topic.src.d.may7", refs: 14, evi: 11, hot: 5 },
  { type: "PAPER", year: "2024", n: "03", titleK: "topic.src.s3.title", auth: "Wang et al.", venue: "NeurIPS 2024", dateK: "topic.src.d.apr17saved", refs: 23, evi: 21, hot: 4, saved: true },
  { type: "BLOG", year: "2025", n: "04", titleK: "topic.src.s4.title", auth: "Lilian Weng", venue: "lilianweng.github.io", dateK: "topic.src.d.may3", refs: 8, evi: 6, hot: 4 },
  { type: "PAPER", year: "2024", n: "05", titleK: "topic.src.s5.title", authK: "topic.src.s5.auth", venue: "arXiv 2404.16130", dateK: "topic.src.d.apr22saved", refs: 12, evi: 14, hot: 4, saved: true },
  { type: "PAPER", year: "2024", n: "06", titleK: "topic.src.s6.title", auth: "Xiao et al.", venue: "ICLR 2024", dateK: "topic.src.d.mar12saved", refs: 9, evi: 8, hot: 3, saved: true },
  { type: "REPORT", year: "2025", n: "07", titleK: "topic.src.s7.title", authK: "topic.src.s7.auth", venue: "crfm.stanford.edu", dateK: "topic.src.d.may1", refs: 7, evi: 9, hot: 3 },
  { type: "VIDEO", year: "2025", n: "08", titleK: "topic.src.s8.title", auth: "Karpathy", venue: "YouTube · 92min", dateK: "topic.src.d.apr29", refs: 5, evi: 4, hot: 3 },
  { type: "PAPER", year: "2023", n: "09", titleK: "topic.src.s9.title", auth: "Packer et al.", venue: "arXiv 2310.08560", dateK: "topic.src.d.feb8saved", refs: 11, evi: 10, hot: 3, saved: true },
  { type: "NEWSLETTER", year: "2025", n: "10", titleK: "topic.src.s10.title", auth: "swyx", venue: "latent.space", dateK: "topic.src.d.may5", refs: 6, evi: 3, hot: 2 },
];

function SourcesPanel() {
  const t = useTranslations();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 36 }}>
      <aside>
        <div className="kicker-red" style={{ marginBottom: 12 }}>{t("topic.src.filter")}</div>
        <div style={{ marginBottom: 18 }}>
          <div className="kicker" style={{ fontSize: 10, marginBottom: 6 }}>{t("topic.src.byType")}</div>
          {([["ALL", 67], ["PAPER", 38], ["BLOG", 12], ["REPORT", 8], ["VIDEO", 5], ["NEWSLETTER", 4]] as const).map(([label, n], i) => (
            <a
              key={label}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                fontSize: 13,
                color: i === 0 ? "var(--accent-red)" : "var(--ink-secondary)",
                textDecoration: "none",
                borderBottom: "1px dotted var(--divider)",
              }}
            >
              <span>{label}</span>
              <span className="font-mono">{n}</span>
            </a>
          ))}
        </div>
        <div style={{ marginBottom: 18 }}>
          <div className="kicker" style={{ fontSize: 10, marginBottom: 6 }}>{t("topic.src.byYear")}</div>
          {([["2025", 24], ["2024", 31], ["2023", 10], ["≤2022", 2]] as const).map(([y, n]) => (
            <a
              key={y}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                fontSize: 13,
                color: "var(--ink-secondary)",
                textDecoration: "none",
                borderBottom: "1px dotted var(--divider)",
              }}
            >
              <span>{y}</span>
              <span className="font-mono">{n}</span>
            </a>
          ))}
        </div>
        <div>
          <div className="kicker" style={{ fontSize: 10, marginBottom: 6 }}>{t("topic.src.byMark")}</div>
          {[
            ["topic.src.savedByYou", "12"],
            ["topic.src.highlighted", "7"],
          ].map(([labelK, n]) => (
            <a
              key={labelK}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                fontSize: 13,
                color: "var(--ink-secondary)",
                textDecoration: "none",
              }}
            >
              <span>{t(labelK)}</span>
              <span className="font-mono">{n}</span>
            </a>
          ))}
        </div>
      </aside>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
          <h2 className="headline" style={{ fontSize: 24, margin: 0 }}>{t("topic.src.title")}</h2>
          <span className="kicker">{t("topic.src.showing")}</span>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={() => alert(t("topic.src.alert.add"))}>{t("topic.src.add")}</button>
        </div>
        {SOURCES.map((s) => {
          const title = t(s.titleK);
          const auth = s.authK ? t(s.authK) : (s.auth ?? "");
          const venue = s.venueK ? t(s.venueK) : (s.venue ?? "");
          const date = t(s.dateK);
          return (
            <article
              key={s.n}
              className="paper-card clickable"
              style={{
                padding: "18px 20px",
                marginBottom: 10,
                display: "grid",
                gridTemplateColumns: "48px 1fr 100px 80px",
                gap: 16,
                alignItems: "center",
              }}
              onClick={() => {
                window.location.href = `/ask?q=${encodeURIComponent(t("topic.src.deepRead") + title)}`;
              }}
            >
              <div className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>
                {s.n}
              </div>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                  <span className="pill" style={{ fontSize: 9 }}>{s.type}</span>
                  <span className="kicker">{venue} · {date}</span>
                  {s.saved && <span className="pill pill-red" style={{ fontSize: 9 }}>SAVED</span>}
                </div>
                <div className="font-serif" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, marginBottom: 2 }}>{title}</div>
                <div className="font-serif" style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-secondary)" }}>{auth}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-primary)" }}>
                  {s.refs}<span style={{ color: "var(--ink-tertiary)", fontSize: 12 }}>{t("topic.src.claims")}</span>
                </div>
                <div className="font-serif" style={{ fontSize: 14, color: "var(--ink-secondary)" }}>
                  {s.evi} <span style={{ color: "var(--ink-tertiary)", fontSize: 11 }}>{t("topic.src.evidence").trim()}</span>
                </div>
              </div>
              <div className="heat-bars" style={{ justifyContent: "flex-end" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className={`heat-bar ${i < s.hot ? "on" : ""}`} />
                ))}
              </div>
            </article>
          );
        })}

        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((p) => (
            <button
              key={p}
              className={`pill ${p === 1 ? "is-active" : ""}`}
              onClick={() => alert(t("topic.src.alert.page") + p)}
            >
              {p}
            </button>
          ))}
          <button className="pill" onClick={() => alert(t("topic.src.alert.next"))}>→</button>
        </div>
      </div>
    </div>
  );
}

/* ============ CLAIMS ============ */
type ClaimRow = { n: string; txtK: string; side: string; conf: number; support: number; contra: number; byK: string };

const CLAIMS: ClaimRow[] = [
  { n: "38", txtK: "topic.cl.c1", side: "PRO LONG-CONTEXT", conf: 88, support: 5, contra: 1, byK: "topic.cl.by1" },
  { n: "37", txtK: "topic.cl.c2", side: "PRO LONG-CONTEXT", conf: 96, support: 4, contra: 0, byK: "topic.cl.by2" },
  { n: "36", txtK: "topic.cl.c3", side: "PRO MEMORY", conf: 74, support: 3, contra: 2, byK: "topic.cl.by3" },
  { n: "35", txtK: "topic.cl.c4", side: "PRO MEMORY", conf: 68, support: 3, contra: 1, byK: "topic.cl.by4" },
  { n: "34", txtK: "topic.cl.c5", side: "COST CONCERN", conf: 91, support: 4, contra: 0, byK: "topic.cl.by5" },
  { n: "33", txtK: "topic.cl.c6", side: "EVAL CONCERN", conf: 79, support: 4, contra: 1, byK: "topic.cl.by6" },
  { n: "32", txtK: "topic.cl.c7", side: "FORECAST", conf: 62, support: 2, contra: 1, byK: "topic.cl.by7" },
  { n: "31", txtK: "topic.cl.c8", side: "EMPIRICAL", conf: 85, support: 3, contra: 0, byK: "topic.cl.by8" },
];

function confColor(c: number) {
  if (c >= 80) return "var(--success-green)";
  if (c >= 60) return "var(--warning-amber)";
  return "var(--accent-red)";
}

function ClaimsPanel({ tid }: { tid: TopicId }) {
  const t = useTranslations();
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <h2 className="headline" style={{ fontSize: 26, margin: 0 }}>{t("topic.cl.title")}</h2>
        <span className="kicker">{t("topic.cl.note")}</span>
      </div>
      <p className="font-serif" style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "0 0 22px" }}>
        {t("topic.cl.lede")}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {(["all", "long", "mem", "cost", "eval", "fcst"] as const).map((k, i) => (
          <button key={k} className={`pill ${i === 0 ? "is-active" : ""}`}>{t(`topic.cl.f.${k}`)}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CLAIMS.map((c) => {
          const txt = t(c.txtK);
          const by = t(c.byK);
          return (
            <article
              key={c.n}
              className="paper-card"
              style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "60px 1fr 200px", gap: 20, alignItems: "center" }}
            >
              <div className="font-serif" style={{ fontSize: 34, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>{c.n}</div>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span className="pill pill-red">{c.side}</span>
                  <span className="kicker">{t("topic.cl.cited")}{by}</span>
                </div>
                <div className="font-serif" style={{ fontSize: 17, lineHeight: 1.5, color: "var(--ink-primary)" }}>{txt}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 10, alignItems: "center" }}>
                  <Link
                    href={`/topic?t=${tid}&tab=evidence&claim=${c.n}`}
                    className="font-mono"
                    style={{ fontSize: 11, color: "var(--accent-red)", textDecoration: "none", letterSpacing: ".1em" }}
                  >
                    ▸ {c.support}{t("topic.cl.supporting")}
                  </Link>
                  <Link
                    href={`/topic?t=${tid}&tab=evidence&claim=${c.n}&pol=contra`}
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      color: c.contra > 0 ? "var(--ink-primary)" : "var(--ink-tertiary)",
                      textDecoration: "none",
                      letterSpacing: ".1em",
                    }}
                  >
                    ▸ {c.contra}{t("topic.cl.contra")}
                  </Link>
                  <Link
                    href={`/ask?q=${encodeURIComponent(t("topic.cl.askPrefix") + txt)}`}
                    className="font-mono"
                    style={{ fontSize: 11, color: "var(--ink-secondary)", textDecoration: "none", letterSpacing: ".1em" }}
                  >
                    {t("topic.cl.askAgent")}
                  </Link>
                </div>
              </div>
              <div>
                <div className="kicker" style={{ fontSize: 10 }}>{t("topic.cl.confidence")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <div className="confidence-track">
                    <div className="confidence-fill" style={{ width: `${c.conf}%`, background: confColor(c.conf) }} />
                  </div>
                  <span className="font-mono" style={{ fontSize: 13, fontWeight: 600 }}>{c.conf}%</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ============ EVIDENCE ============ */
type EviRow = { n: string; k: string; excerpt: string; page: string; supports: string; saved?: boolean };

const EVI: EviRow[] = [
  { n: "412", k: "e1", excerpt: "&hellip; under 2M token sequences, the proposed recurrent compression yields a reconstruction loss of <strong>2.27%</strong> ± 0.04, compared to 3.81% for prior MemGPT-style methods&hellip;", page: "p.7", supports: "Claim #38" },
  { n: "411", k: "e2", excerpt: "Across all 12 categories of needle insertion, Claude 3.5 Sonnet achieved <strong>99.4%</strong> exact-match recall on inputs of 200K tokens. Performance on multi-needle reasoning subset drops to <strong>73.1%</strong>&hellip;", page: "§3.2", supports: "Claim #37" },
  { n: "410", k: "e3", excerpt: "&hellip; on the LongDocQA benchmark, the GraphRAG + 8K window combination outperformed the 200K window baseline on <strong>11 out of 17 metrics</strong>, particularly in multi-hop reasoning&hellip;", page: "p.14", supports: "Claim #36" },
  { n: "409", k: "e4", excerpt: "&hellip; for a 70B model at 200K context, KV cache occupies approximately <strong>~125GB</strong> at fp16, vs ~5GB at 8K context, giving a <strong>25× increase</strong>&hellip;", page: "note", supports: "Claim #34", saved: true },
  { n: "408", k: "e5", excerpt: "&hellip; we ran the RMT v3 compressor on 1,200 code-completion tasks. The reconstruction loss measured was <strong>14.7%</strong> on syntactically dense regions, far exceeding the paper&rsquo;s reported figure&hellip;", page: "§B", supports: "Claim #35" },
];

function EvidencePanel() {
  const t = useTranslations();
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 className="headline" style={{ fontSize: 26, margin: 0 }}>{t("topic.evi.title")}</h2>
        <span className="kicker">{t("topic.evi.note")}</span>
      </div>

      {EVI.map((e) => {
        const title = t(`topic.evi.${e.k}.title`);
        const source = t(`topic.evi.${e.k}.source`);
        return (
          <article
            key={e.n}
            style={{
              marginBottom: 22,
              background: "var(--bg-card)",
              border: "1px solid var(--divider)",
              borderLeft: "3px solid var(--accent-red)",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
              <div className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1, minWidth: 64 }}>
                #{e.n}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span className="kicker-red">{t("topic.evi.supports")}{e.supports}</span>
                  {e.saved && <span className="pill pill-red" style={{ fontSize: 9 }}>{t("topic.evi.yourNote")}</span>}
                </div>
                <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                <div
                  className="kicker"
                  style={{
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    fontSize: 13,
                    textTransform: "none",
                    letterSpacing: 0,
                    color: "var(--ink-secondary)",
                    marginBottom: 12,
                  }}
                >
                  {source} · {e.page}
                </div>
                <blockquote
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 15.5,
                    lineHeight: 1.7,
                    color: "var(--ink-primary)",
                    background: "var(--bg-paper-warm)",
                    borderLeft: "2px solid var(--divider-strong)",
                    padding: "14px 18px",
                    margin: "0 0 14px",
                    fontStyle: "italic",
                  }}
                  dangerouslySetInnerHTML={{ __html: e.excerpt }}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Link
                    href={`/ask?q=${encodeURIComponent(t("topic.evi.expandPrefix") + e.n)}`}
                    className="pill"
                    style={{ textDecoration: "none" }}
                  >
                    {t("topic.evi.expand")}
                  </Link>
                  <button
                    className="pill"
                    onClick={() => alert(t("topic.evi.alert.openPdf") + e.page + t("topic.evi.alert.openPdfTail"))}
                  >
                    {t("topic.evi.openPdf")}
                  </button>
                  <button className="pill" onClick={() => alert(t("topic.evi.alert.savedCard"))}>
                    {t("topic.evi.saveCard")}
                  </button>
                  <Link
                    href={`/ask?q=${encodeURIComponent(t("topic.evi.contraPrefix") + e.n + t("topic.evi.contraSuffix"))}`}
                    className="pill"
                    style={{ textDecoration: "none" }}
                  >
                    {t("topic.evi.findContra")}
                  </Link>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ============ RADAR ============ */
type RadarEvent = { k: string; t: "alert" | "scan"; level?: "HIGH" | "MEDIUM" };

const RADAR_EVENTS: RadarEvent[] = [
  { k: "e1", t: "alert", level: "HIGH" },
  { k: "e2", t: "alert", level: "HIGH" },
  { k: "e3", t: "scan" },
  { k: "e4", t: "alert", level: "MEDIUM" },
  { k: "e5", t: "scan" },
  { k: "e6", t: "scan" },
];

function RadarPanel() {
  const t = useTranslations();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 36 }}>
      <div>
        <h2 className="headline" style={{ fontSize: 26, margin: "0 0 8px" }}>{t("topic.rd.title")}</h2>
        <p className="font-serif" style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "0 0 26px" }}>
          {t("topic.rd.lede")}
        </p>

        <div className="kicker-red" style={{ marginBottom: 14 }}>{t("topic.rd.recent")}</div>
        <div style={{ position: "relative", paddingLeft: 24, borderLeft: "1px dotted var(--divider-strong)" }}>
          {RADAR_EVENTS.map((e) => {
            const date = t(`topic.rd.${e.k}.date`);
            const title = t(`topic.rd.${e.k}.t`);
            const noteKey = `topic.rd.${e.k}.note`;
            // useTranslations returns the key when missing; we treat that as "no note"
            const noteRaw = t(noteKey);
            const note = noteRaw === noteKey ? "" : noteRaw;
            return (
              <div key={e.k} style={{ position: "relative", marginBottom: 18 }}>
                <span
                  style={{
                    position: "absolute",
                    left: -30,
                    top: 6,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: e.t === "alert" ? "var(--accent-red)" : "var(--divider-strong)",
                    border: "2px solid var(--bg-paper)",
                  }}
                />
                <div className="kicker" style={{ marginBottom: 4 }}>
                  {date}{e.level ? ` · ${e.level}` : ""}
                </div>
                <div className="font-serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                {note && (
                  <div className="font-serif" style={{ fontStyle: "italic", color: "var(--ink-secondary)", fontSize: 13.5 }}>
                    {note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <aside style={{ position: "sticky", top: 88, alignSelf: "start" }}>
        <div style={{ border: "1px solid var(--divider)", background: "var(--bg-card)", padding: 18 }}>
          <div className="kicker-red" style={{ marginBottom: 14 }}>{t("topic.rd.threshold")}</div>
          {[1, 2, 3, 4].map((i) => {
            const k = t(`topic.rd.t${i}.k`);
            const v = t(`topic.rd.t${i}.v`);
            const l = i <= 2 ? "HIGH" : "MEDIUM";
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px dotted var(--divider)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13 }}>{k}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--accent-red)" }}>{v}</div>
                </div>
                <span className={`pill ${l === "HIGH" ? "pill-red" : ""}`} style={{ fontSize: 9 }}>{l}</span>
              </div>
            );
          })}
          <button
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
            onClick={() => alert(t("topic.rd.alert.editTh"))}
          >
            {t("topic.rd.editTh")}
          </button>
        </div>

        <div style={{ border: "1px solid var(--divider)", background: "var(--bg-paper-warm)", padding: 18, marginTop: 14 }}>
          <div className="kicker-red" style={{ marginBottom: 10 }}>{t("topic.rd.coverage")}</div>
          <div className="font-serif" style={{ fontSize: 38, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>9</div>
          <div className="kicker" style={{ marginTop: 4 }}>{t("topic.rd.daily")}</div>
          <button
            className="btn btn-red"
            style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
            onClick={() => alert(t("topic.rd.alert.addSrc"))}
          >
            {t("topic.rd.addSrc")}
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ============ BRIEFS (sub-panel) ============ */
type TBriefRow = { k: string; n: string; read: boolean; len: string };

const T_BRIEFS: TBriefRow[] = [
  { k: "b1", n: "08", read: false, len: "11 min" },
  { k: "b2", n: "07", read: true, len: "18 min" },
  { k: "b3", n: "06", read: true, len: "24 min" },
  { k: "b4", n: "05", read: true, len: "9 min" },
  { k: "b5", n: "04", read: true, len: "10 min" },
  { k: "b6", n: "03", read: true, len: "8 min" },
  { k: "b7", n: "02", read: true, len: "6 min" },
  { k: "b8", n: "01", read: true, len: "3 min" },
];

function BriefsPanel() {
  const t = useTranslations();
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 className="headline" style={{ fontSize: 26, margin: 0 }}>{t("topic.br.title")}</h2>
        <button className="btn btn-red" onClick={() => alert(t("topic.br.alert.gen"))}>{t("topic.br.btn.gen")}</button>
      </div>

      {T_BRIEFS.map((b) => (
        <Link
          key={b.n}
          href={`/briefs/${b.n}`}
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 130px 80px 100px",
            gap: 18,
            alignItems: "center",
            padding: "18px 0",
            borderBottom: "1px solid var(--divider)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>{b.n}</div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span className="pill" style={{ fontSize: 9 }}>{t(`topic.br.${b.k}.tag`)}</span>
              {!b.read && <span className="pill pill-red" style={{ fontSize: 9 }}>{t("topic.br.unread")}</span>}
            </div>
            <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
              {t(`topic.br.${b.k}.t`)}
            </div>
          </div>
          <div className="kicker">{t(`topic.br.${b.k}.date`)}</div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--ink-tertiary)" }}>{b.len}</div>
          <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-red)", letterSpacing: ".1em" }}>
            {t("topic.br.read")}
          </div>
        </Link>
      ))}
    </div>
  );
}
