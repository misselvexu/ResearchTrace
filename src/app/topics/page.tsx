"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type TopicStatus = "ACTIVE" | "WATCHING" | "PAUSED";
type FilterKey = "all" | TopicStatus | "pinned";

type TopicRow = {
  id: string;
  k: string; // legacy key suffix (t1..t12)
  name: string;
  n: string;
  img: string;
  items: number;
  claims: number;
  evidence: number;
  briefs: number;
  heat: number;
  status: TopicStatus;
  lastBriefK: string;
  pinned: boolean;
};

const TOPIC_ROWS: TopicRow[] = [
  { id: "llm-longctx", k: "t1", name: "LLM Long Context", n: "01", img: "thumb-longctx.png", items: 147, claims: 38, evidence: 412, briefs: 8, heat: 5, status: "ACTIVE", lastBriefK: "2hAgo", pinned: true },
  { id: "agentic", k: "t2", name: "Agentic Workflows", n: "02", img: "thumb-agentic.png", items: 89, claims: 24, evidence: 213, briefs: 5, heat: 5, status: "ACTIVE", lastBriefK: "today08", pinned: true },
  { id: "eval", k: "t3", name: "AI Evaluation", n: "03", img: "thumb-bench.png", items: 62, claims: 19, evidence: 141, briefs: 4, heat: 4, status: "ACTIVE", lastBriefK: "yesterday", pinned: true },
  { id: "rag", k: "t4", name: "RAG & Memory", n: "04", img: "thumb-rag.png", items: 104, claims: 31, evidence: 298, briefs: 6, heat: 4, status: "ACTIVE", lastBriefK: "today08", pinned: true },
  { id: "pm", k: "t5", name: "AI Product Strategy", n: "05", img: "thumb-strategy.png", items: 78, claims: 22, evidence: 167, briefs: 7, heat: 3, status: "ACTIVE", lastBriefK: "3dAgo", pinned: true },
  { id: "alignment", k: "t6", name: "Alignment & Safety", n: "06", img: "thumb-align.png", items: 43, claims: 14, evidence: 96, briefs: 3, heat: 3, status: "WATCHING", lastBriefK: "5dAgo", pinned: false },
  { id: "multi", k: "t7", name: "Multimodal & Vision", n: "07", img: "thumb-strategy.png", items: 36, claims: 11, evidence: 78, briefs: 2, heat: 3, status: "WATCHING", lastBriefK: "4dAgo", pinned: false },
  { id: "infra", k: "t8", name: "AI Infrastructure", n: "08", img: "thumb-rag.png", items: 51, claims: 15, evidence: 122, briefs: 4, heat: 2, status: "WATCHING", lastBriefK: "7dAgo", pinned: false },
  { id: "finetune", k: "t9", name: "Fine-tuning & Adaptation", n: "09", img: "thumb-longctx.png", items: 29, claims: 9, evidence: 64, briefs: 1, heat: 2, status: "WATCHING", lastBriefK: "10dAgo", pinned: false },
  { id: "opensrc", k: "t10", name: "Open Source Models", n: "10", img: "thumb-agentic.png", items: 67, claims: 18, evidence: 154, briefs: 5, heat: 3, status: "ACTIVE", lastBriefK: "yesterday", pinned: false },
  { id: "reasoning", k: "t11", name: "Reasoning & Math", n: "11", img: "thumb-bench.png", items: 48, claims: 16, evidence: 112, briefs: 3, heat: 4, status: "ACTIVE", lastBriefK: "2dAgo", pinned: false },
  { id: "voice", k: "t12", name: "Voice & Real-time AI", n: "12", img: "thumb-strategy.png", items: 24, claims: 7, evidence: 48, briefs: 1, heat: 2, status: "PAUSED", lastBriefK: "21dAgo", pinned: false },
];

function statusKey(s: TopicStatus) {
  if (s === "ACTIVE") return "topics.statusActive";
  if (s === "WATCHING") return "topics.statusWatching";
  return "topics.statusPaused";
}

function HeatBars({ heat }: { heat: number }) {
  return (
    <span className="heat" title="HEAT">
      <span className="heat-bars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`heat-bar ${i < heat ? "on" : ""}`} />
        ))}
      </span>
    </span>
  );
}

export default function TopicsPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<FilterKey>("all");

  const visible = TOPIC_ROWS.filter((row) => {
    if (filter === "all") return true;
    if (filter === "pinned") return row.pinned;
    return row.status === filter;
  });

  const FILTERS: { key: FilterKey; labelK: string }[] = [
    { key: "all", labelK: "topics.f.all" },
    { key: "ACTIVE", labelK: "topics.f.active" },
    { key: "WATCHING", labelK: "topics.f.watching" },
    { key: "PAUSED", labelK: "topics.f.paused" },
    { key: "pinned", labelK: "topics.f.pinned" },
  ];

  return (
    <AppLayout activeId="topics" crumbKey="topics.crumb">
      {/* Masthead */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "36px 48px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 12 }}>{t("topics.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 48, margin: 0 }}>{t("topics.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "8px 0 0", fontSize: 16, maxWidth: 720 }}
                dangerouslySetInnerHTML={{ __html: t.raw("topics.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 96 }}>02</div>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 28, flexWrap: "wrap", borderTop: "1px solid var(--divider)", paddingTop: 18 }}>
            <span className="kicker">{t("topics.filter")}</span>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`pill ${filter === f.key ? "is-active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {t(f.labelK)}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <button className="btn btn-ghost" onClick={() => toast.info(t("topics.alert.sortHeat"))}>{t("topics.sort")}</button>
            <button className="btn btn-red" onClick={() => toast.success(t("topics.alert.newTopic"))}>{t("topics.new")}</button>
          </div>
        </div>
      </section>

      {/* Topics grid */}
      <section>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 48px 64px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {visible.map((row) => (
              <Link
                key={row.id}
                href={`/topic?t=${row.id}`}
                className="paper-card clickable fade-up"
                style={{ overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit" }}
              >
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", borderBottom: "1px solid var(--divider)" }}>
                  <Image
                    src={`/img/${row.img}`}
                    alt=""
                    fill
                    sizes="(max-width: 1240px) 33vw, 400px"
                    style={{ objectFit: "cover" }}
                  />
                  <span
                    className="watermark-number"
                    style={{
                      position: "absolute",
                      top: -10,
                      right: 6,
                      fontSize: 64,
                      color: "var(--accent-red)",
                      opacity: 0.92,
                      textShadow: "1px 1px 0 rgba(255,255,255,.4)",
                    }}
                  >
                    {row.n}
                  </span>
                  {row.pinned && (
                    <span className="pill pill-solid" style={{ position: "absolute", top: 10, left: 10, fontSize: 9, padding: "2px 8px" }}>
                      PINNED
                    </span>
                  )}
                </div>
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="kicker-red">{t(statusKey(row.status))}</span>
                    <HeatBars heat={row.heat} />
                  </div>
                  <h3 className="font-serif" style={{ fontSize: 21, fontWeight: 600, margin: "2px 0 4px", lineHeight: 1.2 }}>
                    {row.name}
                  </h3>
                  <div
                    className="kicker"
                    style={{
                      marginBottom: 10,
                      fontStyle: "italic",
                      fontFamily: "var(--font-serif)",
                      fontSize: 13,
                      textTransform: "none",
                      letterSpacing: 0,
                      color: "var(--ink-secondary)",
                    }}
                  >
                    {t(`topic.${row.k}.zh`)}
                  </div>
                  <p className="font-serif" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-secondary)", margin: "0 0 14px", flex: 1 }}>
                    {t(`topic.${row.k}.desc`)}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, borderTop: "1px dotted var(--divider-strong)", paddingTop: 12, marginBottom: 12 }}>
                    {([
                      ["ITEMS", row.items],
                      ["CLAIMS", row.claims],
                      ["EVIDENCE", row.evidence],
                      ["BRIEFS", row.briefs],
                    ] as const).map(([label, n]) => (
                      <div key={label}>
                        <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-primary)" }}>{n}</div>
                        <div className="kicker" style={{ fontSize: 9 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kicker">
                      {t("topics.lastBrief")}{t(`topics.lastBrief.${row.lastBriefK}`)}
                    </span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--accent-red)" }}>{t("topics.open")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
