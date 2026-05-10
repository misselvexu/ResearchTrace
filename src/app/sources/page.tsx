"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type SourceType = "RSS" | "EMAIL" | "API" | "EXT" | "MANUAL";
type SourceStatus = "active" | "paused" | "error";
type FilterKey = "all" | SourceType | "active" | "paused";

type SourceRow = {
  k: string; // i18n key index
  type: SourceType;
  status: SourceStatus;
  items: number;
  lastFetchK: string;
};

const ROWS: SourceRow[] = [
  { k: "1", type: "RSS", status: "active", items: 1342, lastFetchK: "now" },
  { k: "2", type: "RSS", status: "active", items: 287, lastFetchK: "min5" },
  { k: "3", type: "RSS", status: "active", items: 96, lastFetchK: "min12" },
  { k: "4", type: "RSS", status: "active", items: 142, lastFetchK: "min34" },
  { k: "5", type: "RSS", status: "active", items: 78, lastFetchK: "h1" },
  { k: "6", type: "EMAIL", status: "active", items: 64, lastFetchK: "today" },
  { k: "7", type: "RSS", status: "active", items: 53, lastFetchK: "h2" },
  { k: "8", type: "RSS", status: "paused", items: 41, lastFetchK: "d2" },
  { k: "9", type: "API", status: "active", items: 218, lastFetchK: "h6" },
  { k: "10", type: "API", status: "error", items: 12, lastFetchK: "yesterday" },
  { k: "11", type: "API", status: "active", items: 89, lastFetchK: "h2" },
  { k: "12", type: "MANUAL", status: "active", items: 34, lastFetchK: "d2" },
  { k: "13", type: "EMAIL", status: "active", items: 27, lastFetchK: "today" },
  { k: "14", type: "EXT", status: "active", items: 156, lastFetchK: "now" },
];

const TYPE_COLOR: Record<SourceType, string> = {
  RSS: "var(--accent-red)",
  EMAIL: "var(--warning-amber)",
  API: "var(--info-blue)",
  EXT: "var(--success-green)",
  MANUAL: "var(--ink-primary)",
};

function statusColor(s: SourceStatus) {
  if (s === "active") return "var(--success-green)";
  if (s === "paused") return "var(--ink-tertiary)";
  return "var(--accent-red)";
}

const FILTERS: { key: FilterKey; labelK: string }[] = [
  { key: "all", labelK: "sources.f.all" },
  { key: "RSS", labelK: "sources.f.RSS" },
  { key: "EMAIL", labelK: "sources.f.EMAIL" },
  { key: "API", labelK: "sources.f.API" },
  { key: "EXT", labelK: "sources.f.EXT" },
  { key: "MANUAL", labelK: "sources.f.MANUAL" },
  { key: "active", labelK: "sources.f.active" },
  { key: "paused", labelK: "sources.f.paused" },
];

export default function SourcesPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<FilterKey>("all");

  const visible = ROWS.filter((row) => {
    if (filter === "all") return true;
    if (filter === "active" || filter === "paused") return row.status === filter;
    return row.type === filter;
  });

  const totalActive = ROWS.filter((r) => r.status === "active").length;
  const totalPaused = ROWS.filter((r) => r.status === "paused").length;
  const totalError = ROWS.filter((r) => r.status === "error").length;

  return (
    <AppLayout activeId="sources" crumbKey="sources.crumb">
      {/* Masthead */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("sources.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 44, margin: 0 }}>{t("sources.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0", fontSize: 15.5, maxWidth: 720 }}
                dangerouslySetInnerHTML={{ __html: t.raw("sources.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 96 }}>{t("sources.watermark")}</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
            {([
              ["sources.stat.total", ROWS.length, "var(--ink-primary)"],
              ["sources.stat.active", totalActive, "var(--success-green)"],
              ["sources.stat.paused", totalPaused, "var(--ink-tertiary)"],
              ["sources.stat.error", totalError, "var(--accent-red)"],
              ["sources.stat.today", 47, "var(--accent-red)"],
            ] as const).map(([lk, n, c]) => (
              <div key={lk}>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, color: c, lineHeight: 1 }}>{n}</div>
                <div className="kicker" style={{ fontSize: 10, marginTop: 2 }}>{t(lk)}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
            <span className="kicker">{t("sources.filter")}</span>
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
            <button className="btn btn-ghost" onClick={() => toast(t("sources.alert.import"))}>
              {t("sources.btn.import")}
            </button>
            <button className="btn btn-ghost" onClick={() => toast(t("sources.alert.export"))}>
              {t("sources.btn.export")}
            </button>
            <button className="btn btn-red" onClick={() => toast(t("sources.alert.add"))}>
              {t("sources.btn.add")}
            </button>
          </div>
        </div>
      </section>

      {/* Sources list */}
      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 48px 64px" }}>
          {/* Column header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "44px 78px 1fr 110px 90px 130px 180px",
              gap: 16,
              alignItems: "center",
              padding: "0 20px 10px",
              borderBottom: "1px solid var(--divider-strong)",
              marginBottom: 8,
            }}
          >
            <span className="kicker" style={{ fontSize: 9 }}>#</span>
            <span className="kicker" style={{ fontSize: 9 }}>{t("sources.col.type")}</span>
            <span className="kicker" style={{ fontSize: 9 }}>{t("sources.col.name")}</span>
            <span className="kicker" style={{ fontSize: 9 }}>{t("sources.col.status")}</span>
            <span className="kicker" style={{ fontSize: 9, textAlign: "right" }}>{t("sources.col.items")}</span>
            <span className="kicker" style={{ fontSize: 9 }}>{t("sources.col.lastFetch")}</span>
            <span className="kicker" style={{ fontSize: 9 }}>{t("sources.col.actions")}</span>
          </div>

          {visible.map((row) => {
            const name = t(`sources.row.${row.k}.name`);
            const src = t(`sources.row.${row.k}.src`);
            return (
              <article
                key={row.k}
                className="paper-card"
                style={{
                  padding: "14px 20px",
                  marginBottom: 6,
                  display: "grid",
                  gridTemplateColumns: "44px 78px 1fr 110px 90px 130px 180px",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>
                  {row.k}
                </div>
                <span
                  className="pill"
                  style={{
                    background: TYPE_COLOR[row.type],
                    color: "#fff",
                    borderColor: TYPE_COLOR[row.type],
                    fontSize: 9,
                    justifySelf: "start",
                  }}
                >
                  {row.type}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    className="font-serif"
                    style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {name}
                  </div>
                  <div
                    className="kicker"
                    style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: 11.5, textTransform: "none", letterSpacing: 0, color: "var(--ink-tertiary)", marginTop: 2 }}
                  >
                    {src}
                  </div>
                </div>
                <span
                  className="pill"
                  style={{ fontSize: 9, color: statusColor(row.status), borderColor: "currentColor", justifySelf: "start" }}
                >
                  {row.status === "active" ? "● " : row.status === "paused" ? "⏸ " : "⚠ "}
                  {t(`sources.f.${row.status}`)}
                </span>
                <div className="font-mono" style={{ fontSize: 13, textAlign: "right", color: "var(--ink-primary)" }}>
                  {row.items.toLocaleString()}
                </div>
                <div className="kicker" style={{ fontSize: 10 }}>
                  {t(`sources.lastFetch.${row.lastFetchK}`)}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px" }}
                    onClick={() =>
                      toast(row.status === "active" ? t("sources.alert.pause") : t("sources.alert.resume"))
                    }
                  >
                    {row.status === "active" ? t("sources.act.pause") : t("sources.act.resume")}
                  </button>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px" }}
                    onClick={() => toast(t("sources.alert.edit"))}
                  >
                    {t("sources.act.edit")}
                  </button>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px", color: "var(--accent-red)", borderColor: "currentColor" }}
                    onClick={() => {
                      if (confirm(t("sources.alert.remove"))) {
                        // demo only
                      }
                    }}
                  >
                    {t("sources.act.remove")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
