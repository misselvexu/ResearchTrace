"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";
import {
  addSourceFromCatalog,
  deleteSource,
  exportSourcesJSON,
  importSourcesJSON,
  liveRowsFromSources,
  renameSource,
  statsFromSources,
  syncSource,
  testSource,
  toggleSourceEnabled,
  useSourcesLive,
  type LegacyType,
  type LegacyStatus,
  type LiveSourceRow,
} from "./sources-data";

type FilterKey = "all" | LegacyType | "active" | "paused";

const TYPE_COLOR: Record<LegacyType, string> = {
  RSS: "var(--accent-red)",
  EMAIL: "var(--warning-amber)",
  API: "var(--info-blue)",
  EXT: "var(--success-green)",
  MANUAL: "var(--ink-primary)",
};

function statusColor(s: LegacyStatus) {
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
  const locale = useLocale();
  const live = useSourcesLive();
  const [filter, setFilter] = useState<FilterKey>("all");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const liveRows: LiveSourceRow[] = liveRowsFromSources(live.items, locale);
  const stats = statsFromSources(live.items);

  const visible = liveRows.filter((row) => {
    if (filter === "all") return true;
    if (filter === "active" || filter === "paused") return row.status === filter;
    return row.type === filter;
  });

  const onAdd = async () => {
    if (typeof window === "undefined") return;
    const name = window.prompt(t("sources.btn.add"));
    if (!name) return;
    const created = await addSourceFromCatalog("rss", name, t);
    if (created) live.refresh();
  };

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const added = await importSourcesJSON(file, t);
    if (added > 0) live.refresh();
  };

  const onExport = () => {
    exportSourcesJSON(live.items, t);
  };

  const onToggle = async (row: LiveSourceRow) => {
    const next = await toggleSourceEnabled(row.raw, t);
    if (next) live.refresh();
  };

  const onEdit = async (row: LiveSourceRow) => {
    if (typeof window === "undefined") return;
    const newName = window.prompt(t("sources.act.edit"), row.name);
    if (!newName || newName === row.name) return;
    const next = await renameSource(row.raw, newName, t);
    if (next) live.refresh();
  };

  const onRemove = async (row: LiveSourceRow) => {
    if (typeof window === "undefined") return;
    if (!window.confirm(t("sources.alert.remove"))) return;
    const ok = await deleteSource(row.id, t);
    if (ok) live.refresh();
  };

  const onTest = async (row: LiveSourceRow) => {
    await testSource(row.id, t);
  };

  const onSync = async (row: LiveSourceRow) => {
    const res = await syncSource(row.id, t);
    if (res) live.refresh();
  };

  return (
    <AppLayout activeId="sources" crumbKey="sources.crumb">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={(e) => void onImportFile(e)}
      />

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

          {/* Stats row — overlaid from live data */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
            {([
              ["sources.stat.total", stats.total, "var(--ink-primary)"],
              ["sources.stat.active", stats.active, "var(--success-green)"],
              ["sources.stat.paused", stats.paused, "var(--ink-tertiary)"],
              ["sources.stat.error", stats.error, "var(--accent-red)"],
              ["sources.stat.today", stats.todayItems, "var(--accent-red)"],
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
            <button className="btn btn-ghost" onClick={onImportClick}>
              {t("sources.btn.import")}
            </button>
            <button className="btn btn-ghost" onClick={onExport}>
              {t("sources.btn.export")}
            </button>
            <button className="btn btn-red" onClick={() => void onAdd()}>
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
              gridTemplateColumns: "44px 78px 1fr 110px 90px 130px 240px",
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

          {live.loading && liveRows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-tertiary)" }}>
              <div className="kicker" style={{ marginBottom: 8 }}>{t("sources.loading")}</div>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-tertiary)" }}>
              <div className="kicker" style={{ marginBottom: 8 }}>{t("sources.empty")}</div>
              <div className="font-serif" style={{ fontSize: 18, fontStyle: "italic" }}>—</div>
            </div>
          ) : (
            visible.map((row) => (
              <article
                key={row.id}
                className="paper-card"
                style={{
                  padding: "14px 20px",
                  marginBottom: 6,
                  display: "grid",
                  gridTemplateColumns: "44px 78px 1fr 110px 90px 130px 240px",
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
                    {row.name}
                  </div>
                  <div
                    className="kicker"
                    style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: 11.5, textTransform: "none", letterSpacing: 0, color: "var(--ink-tertiary)", marginTop: 2 }}
                  >
                    {row.src}
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
                  {row.lastFetch}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px" }}
                    onClick={() => void onToggle(row)}
                  >
                    {row.status === "active" ? t("sources.act.pause") : t("sources.act.resume")}
                  </button>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px" }}
                    onClick={() => void onTest(row)}
                  >
                    {t("sources.act.test")}
                  </button>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px" }}
                    onClick={() => void onSync(row)}
                  >
                    {t("sources.act.sync")}
                  </button>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px" }}
                    onClick={() => void onEdit(row)}
                  >
                    {t("sources.act.edit")}
                  </button>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px", color: "var(--accent-red)", borderColor: "currentColor" }}
                    onClick={() => void onRemove(row)}
                  >
                    {t("sources.act.remove")}
                  </button>
                </div>
              </article>
            ))
          )}

          {live.error && (
            <div style={{ marginTop: 16, padding: 12, border: "1px solid var(--accent-red)", color: "var(--accent-red)", fontSize: 12 }}>
              {live.error}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
