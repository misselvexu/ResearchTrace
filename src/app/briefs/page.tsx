"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type FormatFilter = "all" | "weekly" | "monthly" | "deepdive" | "initial";
type TopicFilter = "all" | "long" | "agentic" | "eval" | "rag" | "product";

type BriefRow = {
  n: string;
  k: string;
  dateK: string;
  topicK: string;
  topicId: TopicFilter;
  img: string;
  read: boolean;
  len: string;
  claims: number;
  evidence: number;
};

const FEATURED = {
  n: "127",
  topicK: "briefs.t.long",
  img: "thumb-longctx.png",
  read: false,
  claims: 7,
  evidence: 23,
};

const BRIEFS: BriefRow[] = [
  { n: "126", k: "b126", dateK: "briefs.d.yesterday", topicK: "briefs.t.agentic", topicId: "agentic", img: "thumb-agentic.png", read: true, len: "9 min", claims: 5, evidence: 18 },
  { n: "125", k: "b125", dateK: "briefs.d.may7", topicK: "briefs.t.long", topicId: "long", img: "thumb-longctx.png", read: true, len: "18 min", claims: 8, evidence: 34 },
  { n: "124", k: "b124", dateK: "briefs.d.may5", topicK: "briefs.t.eval", topicId: "eval", img: "thumb-bench.png", read: true, len: "22 min", claims: 11, evidence: 42 },
  { n: "123", k: "b123", dateK: "briefs.d.may3", topicK: "briefs.t.rag", topicId: "rag", img: "thumb-rag.png", read: true, len: "10 min", claims: 6, evidence: 21 },
  { n: "122", k: "b122", dateK: "briefs.d.may1", topicK: "briefs.t.pm", topicId: "product", img: "thumb-strategy.png", read: true, len: "24 min", claims: 9, evidence: 31 },
  { n: "121", k: "b121", dateK: "briefs.d.apr29", topicK: "briefs.t.align", topicId: "all", img: "thumb-align.png", read: true, len: "7 min", claims: 4, evidence: 15 },
  { n: "120", k: "b120", dateK: "briefs.d.apr25", topicK: "briefs.t.reason", topicId: "all", img: "thumb-bench.png", read: true, len: "11 min", claims: 6, evidence: 19 },
  { n: "119", k: "b119", dateK: "briefs.d.apr22", topicK: "briefs.t.long", topicId: "long", img: "thumb-longctx.png", read: true, len: "13 min", claims: 7, evidence: 28 },
  { n: "118", k: "b118", dateK: "briefs.d.apr18", topicK: "briefs.t.long", topicId: "long", img: "thumb-bench.png", read: true, len: "10 min", claims: 5, evidence: 17 },
];

const FORMAT_FILTERS: { key: FormatFilter; labelK: string }[] = [
  { key: "all", labelK: "briefs.f.all" },
  { key: "weekly", labelK: "briefs.f.weekly" },
  { key: "monthly", labelK: "briefs.f.monthly" },
  { key: "deepdive", labelK: "briefs.f.deepdive" },
  { key: "initial", labelK: "briefs.f.initial" },
];

const TOPIC_FILTERS: { key: TopicFilter; labelK: string }[] = [
  { key: "long", labelK: "briefs.bt.long" },
  { key: "agentic", labelK: "briefs.bt.agentic" },
  { key: "eval", labelK: "briefs.bt.eval" },
  { key: "rag", labelK: "briefs.bt.rag" },
  { key: "product", labelK: "briefs.bt.product" },
];

export default function BriefsPage() {
  const t = useTranslations();
  const [formatF, setFormatF] = useState<FormatFilter>("all");
  const [topicF, setTopicF] = useState<TopicFilter | null>(null);

  const visible = BRIEFS.filter((b) => {
    // Topic filter (single-select; null = no constraint)
    if (topicF && b.topicId !== topicF) return false;
    // Format filter — only "all" implemented; other formats are stub-passthrough until B6 wires real metadata.
    return true;
  });

  void formatF; // reserved: format-level filtering hooks up in B6 with real data fields

  return (
    <AppLayout activeId="briefs" crumbKey="briefs.crumb">
      {/* Masthead */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("briefs.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 46, margin: 0 }}>{t("briefs.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0", maxWidth: 680 }}
              >
                {t("briefs.lede")}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 96 }}>36</div>
            </div>
          </div>

          {/* Filter bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid var(--divider)",
              flexWrap: "wrap",
            }}
          >
            <span className="kicker">{t("briefs.filter")}</span>
            {FORMAT_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`pill ${formatF === f.key ? "is-active" : ""}`}
                onClick={() => setFormatF(f.key)}
              >
                {t(f.labelK)}
              </button>
            ))}
            <span style={{ margin: "0 8px", color: "var(--divider-strong)" }}>|</span>
            <span className="kicker">{t("briefs.byTopic")}</span>
            {TOPIC_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`pill ${topicF === f.key ? "is-active" : ""}`}
                onClick={() => setTopicF(topicF === f.key ? null : f.key)}
              >
                {t(f.labelK)}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <button className="btn btn-red" onClick={() => toast(t("briefs.alert.newBrief"))}>
              {t("briefs.btn.newBrief")}
            </button>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section style={{ background: "var(--bg-paper-warm)", borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "42px 48px" }}>
          <div className="kicker-red" style={{ marginBottom: 16 }}>{t("briefs.featured._value")}</div>
          <Link
            href={`/briefs/${FEATURED.n}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "grid",
              gridTemplateColumns: "380px 1fr",
              gap: 36,
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", border: "1px solid var(--divider)" }}>
                <Image
                  src={`/img/${FEATURED.img}`}
                  alt=""
                  fill
                  sizes="380px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span
                className="watermark-number"
                style={{ position: "absolute", top: -20, left: -16, fontSize: 120 }}
              >
                {FEATURED.n}
              </span>
              {!FEATURED.read && (
                <span
                  className="pill pill-red"
                  style={{ position: "absolute", top: 14, right: 14, fontSize: 10 }}
                >
                  {t("briefs.unread")}
                </span>
              )}
            </div>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <span className="pill pill-red">{t("briefs.weeklyNo")} {FEATURED.n}</span>
                <span className="pill">{t(FEATURED.topicK)}</span>
              </div>
              <h2 className="headline" style={{ fontSize: 34, margin: "0 0 10px", lineHeight: 1.2 }}>
                {t("briefs.featured.title")}
              </h2>
              <div
                className="kicker"
                style={{
                  fontStyle: "italic",
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                  textTransform: "none",
                  letterSpacing: 0,
                  color: "var(--ink-secondary)",
                  marginBottom: 14,
                }}
              >
                {t("briefs.featured.subtitle")}
              </div>
              <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div className="font-serif" style={{ fontSize: 22, fontWeight: 600 }}>{FEATURED.claims}</div>
                  <div className="kicker" style={{ fontSize: 9 }}>{t("briefs.lbl.claims")}</div>
                </div>
                <div>
                  <div className="font-serif" style={{ fontSize: 22, fontWeight: 600 }}>{FEATURED.evidence}</div>
                  <div className="kicker" style={{ fontSize: 9 }}>{t("briefs.lbl.evidence")}</div>
                </div>
                <div>
                  <div className="font-serif" style={{ fontSize: 22, fontWeight: 600 }}>{t("briefs.featured.dateSplit")}</div>
                  <div className="kicker" style={{ fontSize: 9 }}>{t("briefs.delivered")}</div>
                </div>
              </div>
              <button className="btn btn-red">{t("briefs.btn.read")}</button>
            </div>
          </Link>
        </div>
      </section>

      {/* Archive grid */}
      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "42px 48px 64px" }}>
          <div className="kicker-red" style={{ marginBottom: 18 }}>{t("briefs.archive")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {visible.map((b) => (
              <Link
                key={b.n}
                href={`/briefs/${b.n}`}
                className="paper-card"
                style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", overflow: "hidden" }}
              >
                <div style={{ position: "relative", aspectRatio: "16/9", borderBottom: "1px solid var(--divider)", overflow: "hidden" }}>
                  <Image
                    src={`/img/${b.img}`}
                    alt=""
                    fill
                    sizes="(max-width: 1280px) 33vw, 400px"
                    style={{ objectFit: "cover" }}
                  />
                  <span
                    className="watermark-number"
                    style={{ position: "absolute", top: -12, right: 6, fontSize: 70 }}
                  >
                    {b.n}
                  </span>
                </div>
                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <span className="pill" style={{ fontSize: 9 }}>{t(`briefs.${b.k}.tag`)}</span>
                    <span className="pill" style={{ fontSize: 9 }}>{t(b.topicK)}</span>
                  </div>
                  <div className="font-serif" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, marginBottom: 10, flex: 1 }}>
                    {t(`briefs.${b.k}.title`)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      borderTop: "1px dotted var(--divider-strong)",
                      paddingTop: 10,
                    }}
                  >
                    <span className="kicker">{t(b.dateK)}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-secondary)" }}>
                      {b.len} · {b.claims}{t("briefs.lbl.claimsLower")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn-ghost" onClick={() => toast(t("briefs.alert.loadMore"))}>
              {t("briefs.btn.loadMore")}
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
