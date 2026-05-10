"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type HistoryItem = { qK: string; tK: string };
type SourceItem = {
  n: string;
  title: string;
  auth: string;
  venue?: string;
  venueK?: string;
  excerpt: string;
  page: string;
  saved?: boolean;
};

const HISTORY: HistoryItem[] = [
  { qK: "ask.h1", tK: "ask.h.t.justNow" },
  { qK: "ask.h2", tK: "ask.h.t.5min" },
  { qK: "ask.h3", tK: "ask.h.t.today09" },
  { qK: "ask.h4", tK: "ask.h.t.yesterday" },
  { qK: "ask.h5", tK: "ask.h.t.may7" },
  { qK: "ask.h6", tK: "ask.h.t.may5" },
  { qK: "ask.h7", tK: "ask.h.t.may3" },
];

const SOURCES: SourceItem[] = [
  {
    n: "1",
    title: "Recurrent Memory Transformer v3",
    auth: "Bulatov et al., DeepMind 2025",
    venue: "arXiv 2505.04127 · §2.3",
    excerpt:
      "&hellip; we introduce a recurrent compression layer that summarizes past context into a fixed-length memory state, processed at <strong>linear complexity O(n)</strong> regardless of sequence length up to 2,097,152 tokens&hellip;",
    page: "p.4–7",
  },
  {
    n: "2",
    title: "MemGPT: LLMs as Operating Systems",
    auth: "Packer et al. 2023",
    venue: "arXiv 2310.08560 · §3.1",
    excerpt:
      "&hellip; MemGPT manages an explicit two-tier memory hierarchy (main context + recall storage) with <strong>self-directed swap operations</strong>, akin to OS virtual memory&hellip;",
    page: "p.5",
  },
  {
    n: "3",
    title: "LongMem: Augmented Memory for Frozen LLMs",
    auth: "Wang et al. 2024",
    venue: "NeurIPS 2024 · §4",
    excerpt:
      "&hellip; the SideNet acts as an external memory module, retrieving from a 65K-token bank via cross-attention, leaving the base LLM weights frozen&hellip;",
    page: "p.8",
    saved: true,
  },
  {
    n: "4",
    title: "Lilian Weng — Why 200K May Not Be the Answer",
    auth: "lilianweng.github.io",
    venueK: "ask.src.s4.venue",
    excerpt:
      "&hellip; even when the context fits, attention dilution causes accuracy drops on multi-hop tasks. The promise of long-context is overstated for production&hellip;",
    page: "§ ",
  },
];

const RELATED_KEYS = ["ask.related.note", "ask.related.streaming", "ask.related.compare"];

function AskPageInner() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [composer, setComposer] = useState("");
  const [activeSourceN, setActiveSourceN] = useState<string | null>(null);
  const sourceRefs = useRef<Record<string, HTMLElement | null>>({});

  // Click on a citation marker
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const cite = target.closest<HTMLElement>(".cite");
      if (!cite) return;
      e.preventDefault();
      const n = cite.dataset.src ?? cite.textContent?.trim() ?? "";
      if (n) openSource(n);
    }
    const article = document.getElementById("answerBody");
    article?.addEventListener("click", onClick);
    return () => article?.removeEventListener("click", onClick);
  }, []);

  function openSource(n: string) {
    setActiveSourceN(n);
    const card = sourceRefs.current[n];
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function submitFollowup() {
    const v = composer.trim();
    if (!v) return;
    router.push(`/ask?q=${encodeURIComponent(v)}`);
  }

  function newAsk() {
    router.push("/ask");
  }

  function selectHistory(i: number) {
    router.push(`/ask?q=${encodeURIComponent(t(HISTORY[i].qK))}`);
  }

  const displayQ = initialQ || t("ask.q.display");

  return (
    <AppLayout activeId="ask" crumbKey="ask.crumb">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 380px",
          height: "calc(100vh - 56px)",
        }}
      >
        {/* Left aside · history */}
        <aside
          style={{
            borderRight: "1px solid var(--divider)",
            background: "var(--bg-paper-warm)",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--divider)" }}>
            <div className="kicker-red" style={{ marginBottom: 10 }}>
              {t("ask.history")}
            </div>
            <button
              type="button"
              className="btn btn-red"
              style={{ width: "100%", justifyContent: "center", fontSize: 11 }}
              onClick={newAsk}
            >
              {t("ask.newQuestion")}
            </button>
          </div>
          <div style={{ padding: "10px 8px" }}>
            {HISTORY.map((h, i) => {
              const active = i === 0 && !initialQ;
              return (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    selectHistory(i);
                  }}
                  className={active ? "is-active" : ""}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    textDecoration: "none",
                    color: "var(--ink-primary)",
                    borderLeft: `2px solid ${active ? "var(--accent-red)" : "transparent"}`,
                    background: active ? "var(--bg-card)" : "transparent",
                    marginBottom: 2,
                  }}
                >
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.35,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {t(h.qK)}
                  </div>
                  <div className="kicker" style={{ fontSize: 9, marginTop: 4 }}>
                    {t(h.tK)}
                  </div>
                </a>
              );
            })}
          </div>
        </aside>

        {/* Center · answer body */}
        <section
          style={{
            overflowY: "auto",
            padding: "36px 44px 60px",
            background: "var(--bg-paper)",
          }}
        >
          <div className="kicker-red" style={{ marginBottom: 8 }}>
            {t("ask.meta")}
          </div>
          <h1 className="headline" style={{ fontSize: 30, margin: "0 0 24px", lineHeight: 1.22 }}>
            {displayQ}
          </h1>

          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "center",
              padding: "14px 18px",
              background: "var(--bg-card)",
              border: "1px solid var(--divider)",
              marginBottom: 28,
            }}
          >
            <div>
              <div className="kicker" style={{ fontSize: 9 }}>
                {t("ask.confidence")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <div className="confidence-track">
                  <div className="confidence-fill" style={{ width: "87%" }} />
                </div>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 600 }}>
                  87%
                </span>
              </div>
            </div>
            <div style={{ height: 32, width: 1, background: "var(--divider)" }} />
            <div>
              <div className="kicker" style={{ fontSize: 9 }}>
                {t("ask.retrieval")}
              </div>
              <div className="font-mono" style={{ fontSize: 11 }}>
                BM25 ⊕ pgvector → Cohere rerank
              </div>
            </div>
            <div style={{ height: 32, width: 1, background: "var(--divider)" }} />
            <div>
              <div className="kicker" style={{ fontSize: 9 }}>
                {t("ask.model")}
              </div>
              <div className="font-mono" style={{ fontSize: 11 }}>
                Claude 3.5 Sonnet · via Portkey
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="pill"
              onClick={() => toast(t("ask.alert.trace"))}
            >
              {t("ask.showTrace")}
            </button>
          </div>

          <article id="answerBody">
            <p className="font-serif" style={{ fontSize: 17, lineHeight: 1.85 }}>
              <span dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.lede.html") as string }} />
            </p>
            <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 600, margin: "24px 0 10px" }}>
              {t("ask.answer.h1")}
            </h3>
            <p
              className="font-serif"
              style={{ fontSize: 17, lineHeight: 1.85 }}
              dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.p1.html") as string }}
            />
            <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 600, margin: "24px 0 10px" }}>
              {t("ask.answer.h2")}
            </h3>
            <ol style={{ fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: 1.85, paddingLeft: 22 }}>
              <li dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.li1.html") as string }} />
              <li dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.li2.html") as string }} />
              <li dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.li3.html") as string }} />
            </ol>
            <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 600, margin: "24px 0 10px" }}>
              {t("ask.answer.h3")}
            </h3>
            <p
              className="font-serif"
              style={{ fontSize: 17, lineHeight: 1.85 }}
              dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.p2.html") as string }}
            />
            <div
              style={{
                marginTop: 30,
                padding: "18px 22px",
                background: "var(--bg-paper-warm)",
                borderLeft: "3px solid var(--accent-red)",
              }}
            >
              <div className="kicker-red" style={{ marginBottom: 8 }}>
                <span dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.curatorTake") as string }} />
              </div>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", fontSize: 15.5, lineHeight: 1.65, margin: 0 }}
                dangerouslySetInnerHTML={{ __html: t.raw("ask.answer.curator.html") as string }}
              />
            </div>
          </article>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 36,
              paddingTop: 22,
              borderTop: "1px solid var(--divider)",
            }}
          >
            <span className="kicker" style={{ marginRight: 8, alignSelf: "center" }}>
              {t("ask.followup")}
            </span>
            <Link href={`/ask?q=${encodeURIComponent(t("ask.fu.diagram"))}`} className="pill pill-red">
              {t("ask.diagramIt")}
            </Link>
            <Link href={`/ask?q=${encodeURIComponent(t("ask.fu.contradict"))}`} className="pill">
              {t("ask.contradictions")}
            </Link>
            <Link href={`/ask?q=${encodeURIComponent(t("ask.fu.reproduce"))}`} className="pill">
              {t("ask.reproduce")}
            </Link>
            <Link href={`/ask?q=${encodeURIComponent(t("ask.fu.missing"))}`} className="pill">
              {t("ask.missing")}
            </Link>
            <button type="button" className="pill" onClick={() => toast(t("common.savedAsCard"))}>
              {t("ask.saveCard")}
            </button>
            <button
              type="button"
              className="pill pill-solid"
              onClick={() => toast(t("common.shareSuccess"))}
            >
              {t("ask.share")}
            </button>
          </div>

          <div
            style={{
              marginTop: 48,
              padding: "20px 22px",
              background: "var(--bg-paper-warm)",
              border: "1px solid var(--divider)",
            }}
          >
            <div className="kicker-red" style={{ marginBottom: 10 }}>
              {t("ask.followBox")}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitFollowup();
                }}
                placeholder={t("ask.composer")}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  border: "1px solid var(--divider)",
                  background: "var(--bg-card)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  color: "var(--ink-primary)",
                }}
              />
              <button type="button" className="btn btn-red" onClick={submitFollowup}>
                {t("ask.send")}
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <span className="kicker" style={{ fontSize: 9, alignSelf: "center" }}>
                {t("ask.scope")}
              </span>
              <button type="button" className="pill is-active">
                {t("ask.allTopics")}
              </button>
              <button type="button" className="pill">
                {t("ask.thisTopic")}
              </button>
              <button type="button" className="pill">
                {t("ask.savedItems")}
              </button>
              <button type="button" className="pill">
                {t("ask.narrow")}
              </button>
            </div>
          </div>
        </section>

        {/* Right aside · sources */}
        <aside
          style={{
            borderLeft: "1px solid var(--divider)",
            background: "var(--bg-card)",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "18px 18px 12px", borderBottom: "1px solid var(--divider)" }}>
            <div className="kicker-red" style={{ marginBottom: 6 }}>
              {t("ask.sources._value")}
              {SOURCES.length}
            </div>
            <p
              className="font-serif"
              style={{
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--ink-secondary)",
                margin: 0,
              }}
            >
              {t("ask.sources.lede")}
            </p>
          </div>

          <div style={{ padding: "12px 14px" }}>
            {SOURCES.map((s) => {
              const venue = s.venueK ? t(s.venueK) : s.venue;
              const isActive = activeSourceN === s.n;
              return (
                <article
                  key={s.n}
                  ref={(el) => {
                    sourceRefs.current[s.n] = el;
                  }}
                  className="paper-card source-card"
                  style={{
                    padding: "14px 16px",
                    marginBottom: 10,
                    cursor: "pointer",
                    borderColor: isActive ? "var(--accent-red)" : "var(--divider)",
                  }}
                  onClick={() => openSource(s.n)}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span
                      className="cite"
                      style={{ position: "relative", top: 2, minWidth: 22, height: 22, fontSize: 11 }}
                    >
                      {s.n}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="font-serif"
                        style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}
                      >
                        {s.title}
                      </div>
                      <div className="kicker" style={{ fontSize: 9, marginBottom: 8 }}>
                        {s.auth} · {venue}
                      </div>
                      <blockquote
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 12.5,
                          fontStyle: "italic",
                          lineHeight: 1.55,
                          color: "var(--ink-secondary)",
                          margin: "0 0 8px",
                          padding: "6px 10px",
                          borderLeft: "2px solid var(--divider-strong)",
                          background: "var(--bg-paper-warm)",
                        }}
                        dangerouslySetInnerHTML={{ __html: s.excerpt }}
                      />
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {s.saved && (
                          <span
                            className="pill pill-red"
                            style={{ fontSize: 9, padding: "1px 6px" }}
                          >
                            {t("ask.pill.saved")}
                          </span>
                        )}
                        <span
                          className="pill"
                          style={{ fontSize: 9, padding: "1px 6px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toast(t("ask.alert.openPdf") + s.page + t("ask.alert.openPdfTail"));
                          }}
                        >
                          {s.page}
                        </span>
                        <Link
                          href="/topic?t=llm-longctx&tab=evidence"
                          className="pill"
                          style={{ fontSize: 9, padding: "1px 6px", textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t("ask.pill.seeAllEvi")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderTop: "1px solid var(--divider)",
              background: "var(--bg-paper-warm)",
            }}
          >
            <div className="kicker-red" style={{ marginBottom: 8 }}>
              {t("ask.related._value")}
            </div>
            {RELATED_KEYS.map((k) => (
              <a
                key={k}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast(t("ask.alert.openItem") + t(k));
                }}
                style={{
                  display: "block",
                  fontFamily: "var(--font-serif)",
                  fontSize: 13,
                  fontStyle: "italic",
                  padding: "6px 0",
                  color: "var(--ink-primary)",
                  textDecoration: "none",
                  borderBottom: "1px dotted var(--divider)",
                }}
              >
                {t(k)} →
              </a>
            ))}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={null}>
      <AskPageInner />
    </Suspense>
  );
}
