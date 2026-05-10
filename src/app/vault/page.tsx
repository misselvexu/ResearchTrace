"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";

type TopicKey = "longctx" | "agentic" | "rag" | "eval" | "pm" | "other";
type FilterKey = "all" | TopicKey;
type ViewMode = "grid" | "list";

type VaultItem = {
  k: string;
  topic: TopicKey;
  claims: number;
  evidence: number;
  topicId: string;
};

const ITEMS: VaultItem[] = [
  { k: "1", topic: "longctx", claims: 11, evidence: 38, topicId: "llm-longctx" },
  { k: "2", topic: "longctx", claims: 7, evidence: 24, topicId: "llm-longctx" },
  { k: "3", topic: "longctx", claims: 9, evidence: 31, topicId: "llm-longctx" },
  { k: "4", topic: "agentic", claims: 6, evidence: 18, topicId: "agentic" },
  { k: "5", topic: "agentic", claims: 5, evidence: 14, topicId: "agentic" },
  { k: "6", topic: "rag", claims: 8, evidence: 26, topicId: "rag" },
  { k: "7", topic: "rag", claims: 6, evidence: 21, topicId: "rag" },
  { k: "8", topic: "eval", claims: 14, evidence: 47, topicId: "eval" },
  { k: "9", topic: "pm", claims: 4, evidence: 9, topicId: "pm" },
  { k: "10", topic: "eval", claims: 3, evidence: 12, topicId: "eval" },
  { k: "11", topic: "agentic", claims: 7, evidence: 19, topicId: "agentic" },
  { k: "12", topic: "eval", claims: 12, evidence: 34, topicId: "eval" },
];

const TOPIC_COLOR: Record<TopicKey, string> = {
  longctx: "var(--accent-red)",
  agentic: "var(--info-blue)",
  rag: "var(--success-green)",
  eval: "var(--warning-amber)",
  pm: "var(--ink-primary)",
  other: "var(--ink-tertiary)",
};

const FILTERS: { key: FilterKey; labelK: string }[] = [
  { key: "all", labelK: "vault.f.all" },
  { key: "longctx", labelK: "vault.f.longctx" },
  { key: "agentic", labelK: "vault.f.agentic" },
  { key: "rag", labelK: "vault.f.rag" },
  { key: "eval", labelK: "vault.f.eval" },
  { key: "pm", labelK: "vault.f.pm" },
  { key: "other", labelK: "vault.f.other" },
];

export default function VaultPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");

  const visible = ITEMS.filter((it) => {
    if (filter !== "all" && it.topic !== filter) return false;
    if (query.trim()) {
      const title = t(`vault.item.${it.k}.title`).toLowerCase();
      const src = t(`vault.item.${it.k}.src`).toLowerCase();
      const q = query.trim().toLowerCase();
      return title.includes(q) || src.includes(q);
    }
    return true;
  });

  return (
    <AppLayout crumbKey="vault.crumb">
      {/* Masthead */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("vault.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 44, margin: 0 }}>{t("vault.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0", fontSize: 15.5, maxWidth: 720 }}
                dangerouslySetInnerHTML={{ __html: t.raw("vault.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 96, letterSpacing: -2 }}>{t("vault.watermark")}</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
            {([
              ["vault.stat.total", "2,438", "var(--ink-primary)"],
              ["vault.stat.topics", "12", "var(--accent-red)"],
              ["vault.stat.claims", "684", "var(--info-blue)"],
              ["vault.stat.evidence", "2,196", "var(--success-green)"],
              ["vault.stat.size", "1.4 GB", "var(--ink-secondary)"],
            ] as const).map(([lk, n, c]) => (
              <div key={lk}>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, color: c, lineHeight: 1 }}>{n}</div>
                <div className="kicker" style={{ fontSize: 10, marginTop: 2 }}>{t(lk)}</div>
              </div>
            ))}
          </div>

          {/* Search + view + filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("vault.search.placeholder")}
              style={{
                flex: "1 1 280px",
                minWidth: 280,
                padding: "9px 14px",
                border: "1px solid var(--divider)",
                background: "var(--bg-card)",
                fontFamily: "var(--font-serif)",
                fontSize: 14,
                color: "var(--ink-primary)",
              }}
            />
            <span className="kicker" style={{ marginLeft: 8 }}>{t("vault.view._value")}</span>
            <div style={{ display: "inline-flex", border: "1px solid var(--divider-strong)" }}>
              <button
                className={`pill ${view === "grid" ? "is-active" : ""}`}
                style={{ borderRadius: 0, border: "none" }}
                onClick={() => setView("grid")}
              >
                {t("vault.view.grid")}
              </button>
              <button
                className={`pill ${view === "list" ? "is-active" : ""}`}
                style={{ borderRadius: 0, border: "none", borderLeft: "1px solid var(--divider-strong)" }}
                onClick={() => setView("list")}
              >
                {t("vault.view.list")}
              </button>
            </div>
            <button className="btn btn-ghost" onClick={() => alert(t("vault.alert.export"))}>{t("vault.btn.export")}</button>
            <button className="btn btn-red" onClick={() => alert(t("vault.alert.add"))}>{t("vault.btn.add")}</button>
          </div>

          {/* Topic filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            <span className="kicker">{t("vault.filter")}</span>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`pill ${filter === f.key ? "is-active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {t(f.labelK)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Items */}
      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px 64px" }}>
          {visible.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--ink-tertiary)" }}>
              <div className="kicker" style={{ marginBottom: 8 }}>NO MATCH</div>
              <div className="font-serif" style={{ fontSize: 18, fontStyle: "italic" }}>—</div>
            </div>
          ) : view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {visible.map((it) => {
                const title = t(`vault.item.${it.k}.title`);
                const src = t(`vault.item.${it.k}.src`);
                return (
                  <article
                    key={it.k}
                    className="paper-card clickable"
                    style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 180 }}
                    onClick={() => alert(t("vault.alert.open"))}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        className="pill"
                        style={{
                          fontSize: 9,
                          background: TOPIC_COLOR[it.topic],
                          color: "#fff",
                          borderColor: TOPIC_COLOR[it.topic],
                        }}
                      >
                        {t(`vault.topicLabel.${it.topic}`)}
                      </span>
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-tertiary)" }}>#{it.k.padStart(4, "0")}</span>
                    </div>
                    <h3 className="font-serif" style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.3, margin: 0, flex: 1 }}>
                      {title}
                    </h3>
                    <div className="kicker" style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: 12, textTransform: "none", letterSpacing: 0, color: "var(--ink-tertiary)" }}>
                      {src}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dotted var(--divider-strong)", paddingTop: 10 }}>
                      <div style={{ display: "flex", gap: 14 }}>
                        <span className="kicker" style={{ fontSize: 10 }}>
                          <span className="font-serif" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-primary)", marginRight: 4 }}>
                            {it.claims}
                          </span>
                          {t("vault.card.claims")}
                        </span>
                        <span className="kicker" style={{ fontSize: 10 }}>
                          <span className="font-serif" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-primary)", marginRight: 4 }}>
                            {it.evidence}
                          </span>
                          {t("vault.card.evidence")}
                        </span>
                      </div>
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--accent-red)" }}>
                        {t("vault.card.open")}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div>
              {visible.map((it) => {
                const title = t(`vault.item.${it.k}.title`);
                const src = t(`vault.item.${it.k}.src`);
                return (
                  <article
                    key={it.k}
                    className="paper-card clickable"
                    style={{
                      padding: "12px 20px",
                      marginBottom: 6,
                      display: "grid",
                      gridTemplateColumns: "60px 90px 1fr 100px 100px 60px",
                      gap: 16,
                      alignItems: "center",
                    }}
                    onClick={() => alert(t("vault.alert.open"))}
                  >
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-tertiary)" }}>#{it.k.padStart(4, "0")}</span>
                    <span
                      className="pill"
                      style={{
                        fontSize: 9,
                        background: TOPIC_COLOR[it.topic],
                        color: "#fff",
                        borderColor: TOPIC_COLOR[it.topic],
                        justifySelf: "start",
                      }}
                    >
                      {t(`vault.topicLabel.${it.topic}`)}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="font-serif"
                        style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {title}
                      </div>
                      <div
                        className="kicker"
                        style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: 11.5, textTransform: "none", letterSpacing: 0, color: "var(--ink-tertiary)", marginTop: 2 }}
                      >
                        {src}
                      </div>
                    </div>
                    <div className="kicker" style={{ fontSize: 10 }}>
                      <span className="font-serif" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-primary)", marginRight: 4 }}>
                        {it.claims}
                      </span>
                      {t("vault.card.claims")}
                    </div>
                    <div className="kicker" style={{ fontSize: 10 }}>
                      <span className="font-serif" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-primary)", marginRight: 4 }}>
                        {it.evidence}
                      </span>
                      {t("vault.card.evidence")}
                    </div>
                    <Link
                      href={`/topic?t=${it.topicId}`}
                      className="font-mono"
                      style={{ fontSize: 10, color: "var(--accent-red)", textDecoration: "none", justifySelf: "end" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("vault.card.open")}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
