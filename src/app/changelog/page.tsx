"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/shell/public-shell";
import { toast } from "@/components/providers/toast";

type TagId = "added" | "improved" | "fixed" | "breaking" | "security";
type FilterId = "all" | TagId;

const FILTERS: FilterId[] = ["all", "added", "improved", "fixed", "breaking", "security"];

const TAG_COLOR: Record<TagId, { bg: string; fg: string; border: string }> = {
  added: { bg: "color-mix(in oklab, var(--success-green) 12%, transparent)", fg: "var(--success-green)", border: "color-mix(in oklab, var(--success-green) 35%, transparent)" },
  improved: { bg: "color-mix(in oklab, var(--info-blue) 12%, transparent)", fg: "var(--info-blue)", border: "color-mix(in oklab, var(--info-blue) 35%, transparent)" },
  fixed: { bg: "color-mix(in oklab, var(--warning-amber) 14%, transparent)", fg: "var(--warning-amber)", border: "color-mix(in oklab, var(--warning-amber) 40%, transparent)" },
  breaking: { bg: "color-mix(in oklab, var(--accent-red) 14%, transparent)", fg: "var(--accent-red)", border: "color-mix(in oklab, var(--accent-red) 40%, transparent)" },
  security: { bg: "color-mix(in oklab, var(--ink-primary) 8%, transparent)", fg: "var(--ink-primary)", border: "var(--divider-strong)" },
};

// release id -> number of items
const RELEASES: { id: string; itemKeys: string[] }[] = [
  { id: "1", itemKeys: ["i1", "i2", "i3", "i4", "i5", "i6"] },
  { id: "2", itemKeys: ["i1", "i2", "i3"] },
  { id: "3", itemKeys: ["i1", "i2", "i3"] },
  { id: "4", itemKeys: ["i1", "i2", "i3", "i4"] },
  { id: "5", itemKeys: ["i1", "i2", "i3"] },
  { id: "6", itemKeys: ["i1", "i2"] },
];

export default function ChangelogPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<FilterId>("all");

  const filteredReleases = useMemo(() => {
    if (filter === "all") return RELEASES;
    return RELEASES.map((r) => ({
      ...r,
      itemKeys: r.itemKeys.filter((ik) => (t(`changelog.release.${r.id}.${ik}.tag`) as string) === filter),
    })).filter((r) => r.itemKeys.length > 0);
  }, [filter, t]);

  return (
    <PublicShell activeNav="changelog" crumb={t("changelog.crumb")}>
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 48px 8px" }}>
        {/* Masthead */}
        <div style={{ position: "relative", borderBottom: "3px double var(--divider-strong)", paddingBottom: 28, marginBottom: 36 }}>
          <div className="kicker-red" style={{ marginBottom: 12 }}>
            {t("changelog.kicker")}
          </div>
          <h1
            className="headline"
            style={{ fontSize: 44, margin: "0 0 14px", lineHeight: 1.15, maxWidth: 720 }}
          >
            {t("changelog.title")}
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--ink-secondary)",
              margin: "0 0 18px",
              lineHeight: 1.55,
              maxWidth: 720,
            }}
          >
            {t("changelog.subtitle")}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn btn-ghost"
              onClick={() => toast("RSS: /changelog/rss.xml")}
              style={{ fontSize: 12 }}
            >
              {t("changelog.btn.rss")}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => toast(t("changelog.btn.feedback"))}
              style={{ fontSize: 12 }}
            >
              {t("changelog.btn.feedback")}
            </button>
          </div>
          <div
            className="watermark-number"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              fontSize: 110,
              color: "var(--accent-red)",
              opacity: 0.12,
              fontWeight: 700,
              lineHeight: 0.9,
              fontFamily: "var(--font-serif)",
              pointerEvents: "none",
            }}
          >
            {t("changelog.watermark")}
          </div>
        </div>

        {/* Lede */}
        <p
          className="font-serif"
          style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-primary)", margin: "0 0 32px" }}
          dangerouslySetInnerHTML={{ __html: t.raw("changelog.lede.html") as string }}
        />

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            paddingBottom: 18,
            borderBottom: "1px solid var(--divider)",
            marginBottom: 32,
          }}
        >
          <span
            className="kicker"
            style={{ color: "var(--ink-tertiary)", marginRight: 6, fontSize: 11, letterSpacing: "0.12em" }}
          >
            {t("changelog.filter")}
          </span>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="pill"
                style={{
                  cursor: "pointer",
                  border: active ? "1px solid var(--accent-red)" : "1px solid var(--divider-strong)",
                  background: active ? "var(--accent-red)" : "transparent",
                  color: active ? "#fff" : "var(--ink-secondary)",
                  padding: "5px 12px",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {t(`changelog.f.${f}`)}
              </button>
            );
          })}
        </div>

        {/* Releases */}
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {filteredReleases.map((r) => (
            <article key={r.id}>
              <header
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  borderBottom: "1px solid var(--divider-strong)",
                  paddingBottom: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    color: "var(--accent-red)",
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: "0.04em",
                  }}
                >
                  {t(`changelog.release.${r.id}.v`)}
                </span>
                <span
                  className="font-serif"
                  style={{ fontSize: 18, fontWeight: 700, color: "var(--ink-primary)" }}
                >
                  {t(`changelog.release.${r.id}.title`)}
                </span>
                <span style={{ flex: 1 }} />
                <span
                  className="kicker"
                  style={{ color: "var(--ink-tertiary)", fontSize: 11, letterSpacing: "0.12em" }}
                >
                  {t(`changelog.release.${r.id}.d`)}
                </span>
              </header>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {r.itemKeys.map((ik) => {
                  const tag = t(`changelog.release.${r.id}.${ik}.tag`) as TagId;
                  const c = TAG_COLOR[tag];
                  return (
                    <li
                      key={ik}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "84px 1fr",
                        gap: 14,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        className="pill"
                        style={{
                          justifySelf: "start",
                          background: c.bg,
                          color: c.fg,
                          border: `1px solid ${c.border}`,
                          padding: "3px 10px",
                          fontSize: 10,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                        }}
                      >
                        {t(`changelog.tag.${tag}`)}
                      </span>
                      <p
                        className="font-serif"
                        style={{ fontSize: 15, lineHeight: 1.65, margin: 0, color: "var(--ink-primary)" }}
                      >
                        {t(`changelog.release.${r.id}.${ik}.txt`)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
