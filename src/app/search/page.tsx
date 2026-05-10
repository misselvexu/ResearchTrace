"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";

type GroupKey = "briefs" | "claims" | "sources" | "topics";
type TabKey = "all" | GroupKey;

const GROUPS: GroupKey[] = ["briefs", "claims", "sources", "topics"];

const GROUP_HREF: Record<GroupKey, string> = {
  briefs: "/briefs",
  claims: "/today",
  sources: "/sources",
  topics: "/topics",
};

const GROUP_COLOR: Record<GroupKey, string> = {
  briefs: "var(--accent-red)",
  claims: "var(--info-blue)",
  sources: "var(--success-green)",
  topics: "var(--warning-amber)",
};

function SearchInner() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);
  const [tab, setTab] = useState<TabKey>("all");

  // keep state in sync if URL changes externally
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    setSubmitted(q);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSubmitted(q);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(q ? `/search?${params.toString()}` : "/search");
  };

  // Demo result data — pulled from i18n. Each group is a string[] from t.raw().
  const allResults = useMemo(() => {
    const out: Record<GroupKey, string[]> = { briefs: [], claims: [], sources: [], topics: [] };
    for (const g of GROUPS) {
      const raw = t.raw(`search.demo.${g}`);
      if (Array.isArray(raw)) out[g] = raw as string[];
    }
    return out;
  }, [t]);

  // Filter by query (case-insensitive substring match against the demo strings).
  const filtered = useMemo(() => {
    if (!submitted) return allResults;
    const q = submitted.toLowerCase();
    const out: Record<GroupKey, string[]> = { briefs: [], claims: [], sources: [], topics: [] };
    for (const g of GROUPS) {
      out[g] = allResults[g].filter((s) => s.toLowerCase().includes(q));
    }
    return out;
  }, [allResults, submitted]);

  const totalCount = GROUPS.reduce((sum, g) => sum + filtered[g].length, 0);
  const showEmpty = !submitted;
  const showNoResult = submitted && totalCount === 0;

  const visibleGroups: GroupKey[] = tab === "all" ? GROUPS : [tab];

  const TABS: { key: TabKey; labelK: string; count: number }[] = [
    { key: "all", labelK: "search.tab.all", count: totalCount },
    { key: "briefs", labelK: "search.tab.briefs", count: filtered.briefs.length },
    { key: "claims", labelK: "search.tab.claims", count: filtered.claims.length },
    { key: "sources", labelK: "search.tab.sources", count: filtered.sources.length },
    { key: "topics", labelK: "search.tab.topics", count: filtered.topics.length },
  ];

  return (
    <AppLayout crumbKey="search.crumb">
      {/* Masthead */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <div style={{ flex: 1 }}>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("search.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 40, margin: 0 }}>{t("search.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0", fontSize: 15.5, maxWidth: 720 }}
                dangerouslySetInnerHTML={{ __html: t.raw("search.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                className="watermark-number"
                style={{
                  fontSize: 120,
                  color: "var(--accent-red)",
                  opacity: 0.18,
                  fontFamily: "var(--font-serif)",
                  lineHeight: 0.9,
                }}
              >
                {t("search.watermark")}
              </div>
            </div>
          </div>

          {/* Search form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--divider)" }}
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.form.placeholder")}
              autoFocus
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid var(--divider-strong)",
                background: "var(--bg-card)",
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                color: "var(--ink-primary)",
              }}
            />
            <button type="submit" className="btn btn-red" style={{ padding: "12px 20px", fontSize: 12 }}>
              {t("search.form.submit")}
            </button>
          </form>

          {/* Tabs */}
          {submitted && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
              <span className="kicker">{t("search.tab._value")}</span>
              {TABS.map((tb) => (
                <button
                  key={tb.key}
                  className={`pill ${tab === tb.key ? "is-active" : ""}`}
                  onClick={() => setTab(tb.key)}
                >
                  {t(tb.labelK)}
                  <span className="font-mono" style={{ marginLeft: 6, opacity: 0.65, fontSize: 10 }}>
                    {tb.count}
                  </span>
                </button>
              ))}
              <span style={{ flex: 1 }} />
              <span className="kicker" style={{ fontSize: 10 }}>
                <span className="font-serif" style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-red)", marginRight: 4 }}>
                  {totalCount}
                </span>
                {t("search.count.results")}
                {submitted ? <span style={{ marginLeft: 6, fontStyle: "italic", color: "var(--ink-secondary)" }}>{t("search.count.for")} “{submitted}”</span> : null}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Body */}
      <section>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 48px 64px" }}>
          {showEmpty && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("search.empty.kicker")}</div>
              <h2 className="font-serif" style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>
                {t("search.empty.title")}
              </h2>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", fontSize: 15, color: "var(--ink-secondary)", margin: "0 auto 16px", maxWidth: 520, lineHeight: 1.55 }}
              >
                {t("search.empty.lede")}
              </p>
              <div className="kicker" style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: 12, textTransform: "none", letterSpacing: 0, color: "var(--ink-tertiary)" }}>
                {t("search.empty.tip")}
              </div>
            </div>
          )}

          {showNoResult && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("search.noResult.kicker")}</div>
              <h2 className="font-serif" style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>
                {t("search.noResult.title")}
              </h2>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", fontSize: 15, color: "var(--ink-secondary)", margin: "0 auto", maxWidth: 520, lineHeight: 1.55 }}
              >
                {t("search.noResult.lede")}
              </p>
            </div>
          )}

          {submitted && totalCount > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {visibleGroups.map((g) => {
                const items = filtered[g];
                if (items.length === 0) return null;
                return (
                  <div key={g}>
                    <div
                      className="rule-kicker"
                      style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
                    >
                      <span
                        className="kicker-red"
                        style={{ color: GROUP_COLOR[g] }}
                      >
                        {t(`search.group.${g}`)}
                      </span>
                      <Link
                        href={GROUP_HREF[g]}
                        className="font-mono"
                        style={{ fontSize: 10, color: "var(--accent-red)", textDecoration: "none" }}
                      >
                        {t("search.result.open")}
                      </Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {items.map((line, idx) => (
                        <article
                          key={idx}
                          className="paper-card clickable"
                          style={{
                            padding: "14px 18px",
                            display: "grid",
                            gridTemplateColumns: "44px 1fr auto",
                            gap: 14,
                            alignItems: "center",
                          }}
                        >
                          <span
                            className="font-mono"
                            style={{ fontSize: 11, color: "var(--ink-tertiary)", letterSpacing: 0.5 }}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div
                            className="font-serif"
                            style={{
                              fontSize: 15.5,
                              fontWeight: 500,
                              lineHeight: 1.4,
                              color: "var(--ink-primary)",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: highlight(line, submitted),
                            }}
                          />
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link
                              href={`/ask?q=${encodeURIComponent(line)}`}
                              className="pill"
                              style={{ fontSize: 9, padding: "1px 6px", textDecoration: "none" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {t("search.result.ask")}
                            </Link>
                            <Link
                              href={GROUP_HREF[g]}
                              className="pill"
                              style={{ fontSize: 9, padding: "1px 6px", textDecoration: "none", color: "var(--accent-red)", borderColor: "currentColor" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {t("search.result.open")}
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, q: string) {
  const safe = escapeHtml(text);
  if (!q.trim()) return safe;
  const re = new RegExp(escapeRegExp(q), "ig");
  return safe.replace(re, (m) => `<mark style="background:var(--accent-red-soft);color:var(--ink-primary);padding:0 2px;">${m}</mark>`);
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
