/**
 * Today — daily digest page (legacy today.html → app/today/page.tsx).
 *
 * 1:1 visual port. Five sections + colophon, exactly as in
 * legacy/prototype-v0.3/today.html:
 *   1. MASTHEAD          — kicker / headline / lede + button row + No.127 watermark
 *   2. EDITOR'S BRIEF    — 3-col grid (warm paper bg)
 *   3. TOP STORIES       — 1 lead + 2 secondary (heat-bars, action pills)
 *   4. RADAR PULSE       — 4 stat cards + 2-col trending/cited list (warm paper bg)
 *   5. FROM YOUR VAULT   — 3 paper-cards
 *   6. ASK AGENT ROW     — dark band, suggested questions
 *   7. COLOPHON          — footer
 *
 * Data is currently hard-coded inline (mirrors legacy literal HTML); B6 will
 * wire it to the MSW-backed `/api/v1/briefs/today` + `/api/v1/inbox` mock
 * handlers via the type contracts created in B2.
 */

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";

// ---------- HEAT BARS ----------------------------------------------------

function HeatBars({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="heat-bars">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`heat-bar${i < filled ? " on" : ""}`} />
      ))}
    </span>
  );
}

// ---------- THE PAGE -----------------------------------------------------

export default function TodayPage() {
  const t = useTranslations();

  // Mirrors legacy today.html inline arrays
  const RADAR_STATS = [
    { n: "+34%", tk: "today.radar.s1.t", sk: "today.radar.s1.s", color: "var(--success-green)" },
    { n: "5", tk: "today.radar.s2.t", sk: "today.radar.s2.s", color: "var(--warning-amber)" },
    { n: "126", tk: "today.radar.s3.t", sk: "today.radar.s3.s", color: "var(--accent-red)" },
    { n: "3", tk: "today.radar.s4.t", sk: "today.radar.s4.s", color: "var(--accent-red)" },
  ];

  const TRENDING = [
    { rank: "01", topic: "LLM Long Context", titleKey: "today.radar.r1", heat: 5, href: "/topic?t=llm-longctx" },
    { rank: "02", topic: "Agentic Workflows", titleKey: "today.radar.r2", heat: 4, href: "/topic?t=agentic" },
    { rank: "03", topic: "AI Evaluation", titleKey: "today.radar.r3", heat: 4, href: "/topic?t=eval" },
    { rank: "04", topic: "RAG & Memory", titleKey: "today.radar.r4", heat: 3, href: "/topic?t=rag" },
    { rank: "05", topic: "AI Product Strategy", titleKey: "today.radar.r5", heat: 3, href: "/topic?t=pm" },
  ];

  const CITED = [
    { n: "23×", t: "Recurrent Memory Transformer v3", a: "Bulatov et al., 2025", href: "/topic?t=llm-longctx" },
    { n: "19×", t: "ReAct: Reasoning + Acting", a: "Yao et al., 2023", href: "/topic?t=agentic" },
    { n: "14×", t: "Self-Refine via Critic", a: "Madaan et al., 2024", href: "/topic?t=agentic" },
    { n: "12×", t: "GraphRAG: Microsoft Research", a: "Edge et al., 2024", href: "/topic?t=rag" },
    { n: "11×", t: "HELM v3 Holistic Evaluation", a: "Liang et al., 2025", href: "/topic?t=eval" },
  ];

  const VAULT_ITEMS = [
    {
      img: "/img/thumb-longctx.png",
      date: "4月 17日",
      n: "23",
      title: "LongMem: Augmented Memory for Frozen LLMs",
      note: "已被 02/03 篇头条隐性引用，建议重读 §3 与今日 RMT v3 对照",
      href: "/topic?t=llm-longctx&item=longmem",
    },
    {
      img: "/img/thumb-rag.png",
      date: "4月 22日",
      n: "24",
      title: "GraphRAG: Local-Global Reasoning for QA",
      note: "与 Mem0 v2 共享 episodic memory 假设；已生成对比卡片",
      href: "/topic?t=rag&item=graphrag",
    },
    {
      img: "/img/thumb-strategy.png",
      date: "5月 02日",
      n: "25",
      title: "a16z: The State of Generative AI 2025",
      note: "含 Top 50 AI Apps 列表；Curator 已提取 18 项数据点",
      href: "/topic?t=pm&item=a16z",
    },
  ];

  const ASK_QUESTIONS = ["today.ask.q1", "today.ask.q2", "today.ask.q3", "today.ask.q4"];

  return (
    <AppLayout activeId="today" crumbKey="today.crumb">
      {/* ============ MASTHEAD ============ */}
      <section style={{ borderBottom: "1px solid var(--divider)", background: "var(--bg-paper)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 48px 28px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 14 }}>
                {t("today.kicker")}
              </div>
              <h1 className="headline" style={{ fontSize: 54, margin: "0 0 8px" }}>
                {t("today.headline")}
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 17,
                  color: "var(--ink-secondary)",
                  margin: 0,
                  maxWidth: 640,
                }}
                dangerouslySetInnerHTML={{ __html: t.raw("today.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 120, opacity: 0.85 }}>
                No.
                <br />
                127
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-red" type="button">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{t("today.btn.markRead")}</span>
            </button>
            <Link href="/briefs" className="btn btn-ghost">
              {t("today.btn.archive")}
            </Link>
            <button className="btn btn-ghost" type="button">
              {t("today.btn.weekly")}
            </button>
            <span style={{ flex: 1 }} />
            <span className="kicker">{t("today.delivered")}</span>
          </div>
        </div>
      </section>

      {/* ============ EDITOR'S BRIEF ============ */}
      <section style={{ background: "var(--bg-paper-warm)", borderBottom: "1px solid var(--divider)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "30px 48px",
            display: "grid",
            gridTemplateColumns: "240px 1fr 220px",
            gap: 32,
            alignItems: "start",
          }}
        >
          <div>
            <div className="kicker-red" style={{ marginBottom: 8 }}>
              {t("today.fromEditor")}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              {t("today.editorHead")}
            </div>
            <div className="kicker">{t("today.editor.meta")}</div>
          </div>
          <div className="callout-brief">
            <span className="label">{t("today.editor.label")}</span>
            <span dangerouslySetInnerHTML={{ __html: t.raw("today.editor.body.html") as string }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/ask?q=两种长上下文路线的本质区别" className="pill pill-red">
              {t("today.editor.deepDive")}
            </Link>
            <button type="button" className="pill">
              {t("today.editor.readLater")}
            </button>
            <button type="button" className="pill">
              {t("today.editor.saveCard")}
            </button>
          </div>
        </div>
      </section>

      {/* ============ TOP STORIES ============ */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "42px 48px", position: "relative" }}>
          <div className="rule-kicker">
            <span className="kicker-red">{t("today.section1")}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 32 }}>
            {/* Lead story */}
            <article className="clickable">
              <Link href="/topic?t=llm-longctx&claim=rmt-v3" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ position: "relative", marginBottom: 18 }}>
                  <Image
                    src="/img/thumb-longctx.png"
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
                  <span className="pill pill-red">LLM · LONG CONTEXT</span>
                  <span className="kicker">arXiv 2505.04127 · 23 May</span>
                </div>
                <h2 className="headline" style={{ fontSize: 30, margin: "6px 0 10px" }}>
                  {t("today.story1.title")}
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
                  <HeatBars filled={5} />
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
              <Link href="/topic?t=llm-longctx&claim=claude-needle" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <Image
                    src="/img/thumb-bench.png"
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
                  <span className="pill">EVAL · NEEDLE-IN-HAYSTACK</span>
                </div>
                <h3 className="headline" style={{ fontSize: 20, margin: "4px 0 8px", lineHeight: 1.25 }}>
                  {t("today.story2.title")}
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
                  <HeatBars filled={4} />
                  <span style={{ marginLeft: 8 }}>4/5</span>
                </div>
              </Link>
            </article>

            {/* Story 03 */}
            <article className="clickable">
              <Link href="/topic?t=agentic&claim=swe-bench" style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <Image
                    src="/img/thumb-agentic.png"
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
                  <span className="pill">AGENT · SWE-BENCH</span>
                </div>
                <h3 className="headline" style={{ fontSize: 20, margin: "4px 0 8px", lineHeight: 1.25 }}>
                  {t("today.story3.title")}
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
                  <HeatBars filled={4} />
                  <span style={{ marginLeft: 8 }}>4/5</span>
                </div>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ============ RADAR PULSE ============ */}
      <section style={{ background: "var(--bg-paper-warm)", borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "42px 48px" }}>
          <div className="rule-kicker">
            <span className="kicker-red">{t("today.section2")}</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 18,
              marginBottom: 32,
            }}
          >
            {RADAR_STATS.map((s, idx) => (
              <Link
                key={idx}
                href="/topics"
                className="paper-card clickable"
                style={{ padding: "22px 20px", textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div
                  className="font-serif"
                  style={{
                    fontSize: 38,
                    fontWeight: 700,
                    color: s.color,
                    lineHeight: 1,
                    letterSpacing: "-.02em",
                  }}
                >
                  {s.n}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500 }}>{t(s.tk)}</div>
                <div className="kicker" style={{ marginTop: 4, fontSize: 10 }}>
                  {t(s.sk)}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 12 }}>
                {t("today.radar.col1")}
              </div>
              {TRENDING.map((s) => (
                <Link
                  key={s.rank}
                  href={s.href}
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
                    {s.rank}
                  </span>
                  <span className="pill" style={{ justifySelf: "start", fontSize: 10 }}>
                    {s.topic}
                  </span>
                  <span style={{ fontSize: 14, fontFamily: "var(--font-serif)" }}>
                    {t(s.titleKey)}
                  </span>
                  <HeatBars filled={s.heat} />
                </Link>
              ))}
            </div>

            <div>
              <div className="kicker-red" style={{ marginBottom: 12 }}>
                {t("today.radar.col2")}
              </div>
              {CITED.map((s) => (
                <Link
                  key={s.t}
                  href={s.href}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "54px 1fr",
                    gap: 14,
                    alignItems: "baseline",
                    padding: "13px 0",
                    borderBottom: "1px solid var(--divider)",
                    textDecoration: "none",
                    color: "var(--ink-primary)",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-red)" }}
                  >
                    {s.n}
                  </span>
                  <span>
                    <div
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 14.5,
                        fontWeight: 500,
                        lineHeight: 1.3,
                      }}
                    >
                      {s.t}
                    </div>
                    <div className="kicker" style={{ marginTop: 2, fontStyle: "italic" }}>
                      {s.a}
                    </div>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FROM YOUR VAULT ============ */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "42px 48px" }}>
          <div className="rule-kicker">
            <span className="kicker-red">{t("today.section3")}</span>
          </div>

          <p
            className="font-serif"
            style={{
              fontStyle: "italic",
              color: "var(--ink-secondary)",
              maxWidth: 680,
              margin: "0 0 22px",
              fontSize: 15,
            }}
            dangerouslySetInnerHTML={{ __html: t.raw("today.vault.lede.html") as string }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {VAULT_ITEMS.map((s) => (
              <article
                key={s.title}
                className="paper-card clickable"
                style={{ overflow: "hidden", padding: 0 }}
              >
                <Link href={s.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <Image
                    src={s.img}
                    alt=""
                    width={800}
                    height={450}
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      objectFit: "cover",
                      borderBottom: "1px solid var(--divider)",
                      height: "auto",
                    }}
                  />
                  <div style={{ padding: "18px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: 6,
                      }}
                    >
                      <span className="kicker">
                        <span>{t("today.vault.saved")}</span>
                        {s.date}
                      </span>
                      <span
                        className="font-serif"
                        style={{
                          fontSize: 32,
                          fontWeight: 700,
                          color: "var(--accent-red)",
                          lineHeight: 0.9,
                        }}
                      >
                        {s.n}
                      </span>
                    </div>
                    <div
                      className="font-serif"
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        marginBottom: 8,
                      }}
                    >
                      {s.title}
                    </div>
                    <p
                      className="font-serif"
                      style={{
                        fontStyle: "italic",
                        fontSize: 13,
                        color: "var(--ink-secondary)",
                        margin: "0 0 10px",
                        lineHeight: 1.5,
                      }}
                    >
                      {s.note}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="pill">{t("today.vault.action.viewCard")}</span>
                      <span className="pill">{t("today.vault.action.askAgent")}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ASK AGENT ROW ============ */}
      <section style={{ background: "var(--bg-sidebar)", color: "var(--ink-inverse)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "48px 48px",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div className="kicker-red" style={{ marginBottom: 14 }}>
              {t("today.section4")}
            </div>
            <h2 className="headline" style={{ fontSize: 32, color: "#fff", margin: "0 0 14px" }}>
              {t("today.ask.headline")}
            </h2>
            <p
              className="font-serif"
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--ink-mute-on-dark)",
                margin: "0 0 22px",
                maxWidth: 520,
              }}
              dangerouslySetInnerHTML={{ __html: t.raw("today.ask.body.html") as string }}
            />
            <Link href="/ask" className="btn btn-red">
              {t("today.ask.cta")}
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="kicker" style={{ color: "var(--ink-mute-on-dark)" }}>
              {t("today.ask.suggested")}
            </div>
            {ASK_QUESTIONS.map((qk) => (
              <Link
                key={qk}
                href="/ask"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 14px",
                  background: "var(--bg-sidebar-2)",
                  borderLeft: "2px solid transparent",
                  textDecoration: "none",
                  color: "var(--ink-mute-on-dark)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                  transition: "all .15s",
                }}
              >
                <span className="font-mono" style={{ fontSize: 11, color: "var(--accent-red-soft)" }}>
                  →
                </span>
                <span>{t(qk)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COLOPHON ============ */}
      <footer style={{ background: "var(--bg-paper)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 48px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 32,
            borderTop: "3px double var(--divider-strong)",
          }}
        >
          <div>
            <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              研迹 ResearchTrace
            </div>
            <div className="kicker">A PAPER FOR ONE READER · YOU.</div>
            <div
              className="font-serif"
              style={{
                fontStyle: "italic",
                color: "var(--ink-secondary)",
                marginTop: 10,
                fontSize: 13,
              }}
            >
              {t("today.foot.tagline")}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,auto)", gap: 48 }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                {t("today.foot.product")}
              </div>
              <Link
                href="/topics"
                style={{
                  display: "block",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--ink-secondary)",
                  marginBottom: 4,
                }}
              >
                Topics
              </Link>
              <Link
                href="/ask"
                style={{
                  display: "block",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--ink-secondary)",
                  marginBottom: 4,
                }}
              >
                Ask
              </Link>
              <Link
                href="/briefs"
                style={{
                  display: "block",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--ink-secondary)",
                }}
              >
                Briefs
              </Link>
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                {t("today.foot.vault")}
              </div>
              <Link
                href="/inbox"
                style={{
                  display: "block",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--ink-secondary)",
                  marginBottom: 4,
                }}
              >
                Inbox
              </Link>
              <Link
                href="/onboarding"
                style={{
                  display: "block",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--ink-secondary)",
                }}
              >
                Onboarding
              </Link>
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                {t("today.foot.account")}
              </div>
              <Link
                href="/settings"
                style={{
                  display: "block",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--ink-secondary)",
                  marginBottom: 4,
                }}
              >
                Settings
              </Link>
              <Link
                href="/pricing"
                style={{
                  display: "block",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--ink-secondary)",
                }}
              >
                Pricing
              </Link>
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                {t("today.foot.next")}
              </div>
              <div className="font-mono" style={{ fontSize: 13, color: "var(--ink-primary)" }}>
                MON · 08:00
              </div>
              <div className="kicker" style={{ marginTop: 4 }}>
                {t("today.foot.weekly")}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "18px 48px",
            display: "flex",
            justifyContent: "space-between",
            color: "var(--ink-tertiary)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: ".14em",
          }}
        >
          <span>VERSION 0.4.0-PROTOTYPE · INK &amp; PAPER EDITION</span>
          <span>RENDERED · 2026·05·09 · 09:14 CST</span>
        </div>
      </footer>
    </AppLayout>
  );
}
