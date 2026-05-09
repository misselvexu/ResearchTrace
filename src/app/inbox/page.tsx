"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";

type InboxType = "PDF" | "URL" | "TWITTER" | "YOUTUBE" | "EMAIL" | "NOTION";
type InboxStatus = "PARSING" | "INDEXED" | "TRANSCRIBING" | "FAILED";
type FilterKey = "all" | InboxType;

type InboxItem = {
  n: string;
  k: string;
  type: InboxType;
  srcK: string;
  timeK: string;
  status: InboxStatus;
  topicK: string;
  size: string;
  pages?: string;
  pagesK?: string;
  pagesSuffixK?: string;
  new?: boolean;
  topicId: string;
};

const ITEMS: InboxItem[] = [
  { n: "47", k: "1", type: "PDF", srcK: "inbox.src.dragged", timeK: "inbox.t.0911", status: "PARSING", topicK: "inbox.topic.long", size: "2.4 MB", pages: "24p", new: true, topicId: "llm-longctx" },
  { n: "46", k: "2", type: "URL", srcK: "inbox.src.chromeExt", timeK: "inbox.t.0908", status: "INDEXED", topicK: "inbox.topic.long", size: "—", pagesK: "inbox.size.web", new: true, topicId: "llm-longctx" },
  { n: "45", k: "3", type: "TWITTER", srcK: "inbox.src.x", timeK: "inbox.t.0852", status: "INDEXED", topicK: "inbox.topic.long", size: "—", pagesK: "inbox.size.thread", new: true, topicId: "llm-longctx" },
  { n: "44", k: "4", type: "YOUTUBE", srcK: "inbox.src.youtube", timeK: "inbox.t.0830", status: "TRANSCRIBING", topicK: "inbox.topic.long", size: "92 min", pagesK: "inbox.size.video", topicId: "llm-longctx" },
  { n: "43", k: "5", type: "EMAIL", srcK: "inbox.src.fwdEmail", timeK: "inbox.t.0814", status: "INDEXED", topicK: "inbox.topic.long", size: "—", pagesK: "inbox.size.newsletter", topicId: "llm-longctx" },
  { n: "42", k: "6", type: "PDF", srcK: "inbox.src.emailFwd", timeK: "inbox.t.yesterday2214", status: "INDEXED", topicK: "inbox.topic.rag", size: "3.1 MB", pages: "31p", topicId: "rag" },
  { n: "41", k: "7", type: "URL", srcK: "inbox.src.chromeExt", timeK: "inbox.t.yesterday1902", status: "INDEXED", topicK: "inbox.topic.pm", size: "—", pagesK: "inbox.size.longread", topicId: "pm" },
  { n: "40", k: "8", type: "NOTION", srcK: "inbox.src.notion", timeK: "inbox.t.yesterday1400", status: "INDEXED", topicK: "inbox.topic.long", size: "—", pages: "6", pagesSuffixK: "inbox.size.notes", topicId: "llm-longctx" },
  { n: "39", k: "9", type: "PDF", srcK: "inbox.src.dragged", timeK: "inbox.t.may7", status: "INDEXED", topicK: "inbox.topic.eval", size: "5.8 MB", pages: "54p", topicId: "eval" },
  { n: "38", k: "10", type: "URL", srcK: "inbox.src.chromeExt", timeK: "inbox.t.may7", status: "INDEXED", topicK: "inbox.topic.agentic", size: "—", pagesK: "inbox.size.web", topicId: "agentic" },
];

const TYPE_COLOR: Record<InboxType, string> = {
  PDF: "var(--accent-red)",
  URL: "var(--info-blue)",
  TWITTER: "var(--ink-primary)",
  YOUTUBE: "var(--accent-red-deep)",
  EMAIL: "var(--warning-amber)",
  NOTION: "var(--success-green)",
};

function statusColor(s: InboxStatus) {
  if (s === "INDEXED") return "var(--success-green)";
  if (s === "PARSING" || s === "TRANSCRIBING") return "var(--warning-amber)";
  return "var(--ink-tertiary)";
}

const FILTERS: { key: FilterKey; labelK: string }[] = [
  { key: "all", labelK: "inbox.f.all" },
  { key: "PDF", labelK: "inbox.f.pdf" },
  { key: "URL", labelK: "inbox.f.url" },
  { key: "TWITTER", labelK: "inbox.f.twitter" },
  { key: "YOUTUBE", labelK: "inbox.f.youtube" },
  { key: "EMAIL", labelK: "inbox.f.email" },
  { key: "NOTION", labelK: "inbox.f.notion" },
];

export default function InboxPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<FilterKey>("all");
  const visible = ITEMS.filter((it) => filter === "all" || it.type === filter);

  return (
    <AppLayout activeId="inbox" crumbKey="inbox.crumb">
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("inbox.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 44, margin: 0 }}>{t("inbox.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0" }}
                dangerouslySetInnerHTML={{ __html: t.raw("inbox.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 96 }}>47</div>
            </div>
          </div>

          <div
            onClick={() => alert(t("inbox.alert.openPicker"))}
            className="clickable"
            style={{
              marginTop: 24,
              border: "2px dashed var(--divider-strong)",
              background: "var(--bg-paper-warm)",
              padding: 24,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 42, fontWeight: 700, color: "var(--accent-red)" }}>+</div>
            <div style={{ flex: 1 }}>
              <div className="font-serif" style={{ fontSize: 18, fontWeight: 600 }}>{t("inbox.dropzone.title")}</div>
              <div className="font-serif" style={{ fontStyle: "italic", fontSize: 13.5, color: "var(--ink-secondary)", marginTop: 2 }}>
                {t("inbox.dropzone.sub")}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="pill"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(t("inbox.alert.copyEmail"));
                }}
              >
                {t("inbox.btn.emailFwd")}
              </button>
              <button
                className="pill"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(t("inbox.alert.installExt"));
                }}
              >
                {t("inbox.btn.installExt")}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
            {([
              ["inbox.stat.parsing", 1, "var(--warning-amber)"],
              ["inbox.stat.transcribing", 1, "var(--warning-amber)"],
              ["inbox.stat.indexed", 45, "var(--success-green)"],
              ["inbox.stat.failed", 0, "var(--ink-tertiary)"],
              ["inbox.stat.newSince", 3, "var(--accent-red)"],
            ] as const).map(([lk, n, c]) => (
              <div key={lk}>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, color: c, lineHeight: 1 }}>{n}</div>
                <div className="kicker" style={{ fontSize: 10, marginTop: 2 }}>{t(lk)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
            <span className="kicker">{t("inbox.filter")}</span>
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
            <button className="btn btn-ghost" onClick={() => alert(t("inbox.alert.bulkClassify"))}>
              {t("inbox.btn.bulkClassify")}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 48px 64px" }}>
          {visible.map((it) => {
            const title = t(`inbox.it.${it.k}.title`);
            const source = t(it.srcK) + t(it.timeK);
            const topic = t(it.topicK);
            const pages = it.pagesK
              ? t(it.pagesK)
              : it.pagesSuffixK
              ? `${it.pages}${t(it.pagesSuffixK)}`
              : it.pages ?? "";
            return (
              <article
                key={it.n}
                className="paper-card clickable"
                style={{
                  padding: "16px 20px",
                  marginBottom: 8,
                  display: "grid",
                  gridTemplateColumns: "50px 70px 1fr 200px 110px 120px 80px",
                  gap: 16,
                  alignItems: "center",
                }}
                onClick={() => alert(`${t("inbox.alert.openItem")}${it.n}${t("inbox.alert.openItemTail")}`)}
              >
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>
                  {it.n}
                </div>
                <span
                  className="pill"
                  style={{ background: TYPE_COLOR[it.type], color: "#fff", borderColor: TYPE_COLOR[it.type], fontSize: 9, justifySelf: "start" }}
                >
                  {it.type}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                    <div
                      className="font-serif"
                      style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {title}
                    </div>
                    {it.new && <span className="pill pill-red" style={{ fontSize: 8, padding: "1px 5px" }}>NEW</span>}
                  </div>
                  <div
                    className="kicker"
                    style={{ fontStyle: "italic", fontFamily: "var(--font-serif)", fontSize: 12, textTransform: "none", letterSpacing: 0 }}
                  >
                    {source}
                  </div>
                </div>
                <Link
                  href={`/topic?t=${it.topicId}`}
                  className="pill"
                  style={{ justifySelf: "start", fontSize: 10, textDecoration: "none" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {topic}
                </Link>
                <div className="kicker">{it.size} · {pages}</div>
                <div>
                  <span
                    className="pill"
                    style={{ fontSize: 9, color: statusColor(it.status), borderColor: "currentColor" }}
                  >
                    {(it.status === "PARSING" || it.status === "TRANSCRIBING") ? "⚙ " : ""}{it.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(t("inbox.alert.openCard"));
                    }}
                  >
                    {t("inbox.btn.card")}
                  </button>
                  <Link
                    href={`/ask?q=${encodeURIComponent(t("inbox.askPrefix") + title)}`}
                    className="pill"
                    style={{ fontSize: 9, padding: "1px 6px", textDecoration: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("inbox.btn.ask")}
                  </Link>
                </div>
              </article>
            );
          })}

          <div style={{ textAlign: "center", marginTop: 22 }}>
            <button className="btn btn-ghost" onClick={() => alert(t("inbox.alert.loadMore"))}>
              {t("inbox.btn.loadMore")}
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
