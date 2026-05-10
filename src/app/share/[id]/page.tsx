"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PrefSwitcher } from "@/components/providers/pref-switcher";
import { toast } from "@/components/providers/toast";

type Params = { id: string };

const CLAIMS = ["1", "2", "3", "4"] as const;
const EVIDENCE_SRC = ["src1", "src2", "src3", "src4"] as const;

export default function SharePage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore — copying may be blocked in sandboxed iframes
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-paper)", color: "var(--ink-primary)" }}>
      {/* Branded header — same shape as login/signup but neutral content */}
      <header
        style={{
          borderBottom: "1px solid var(--divider)",
          padding: "20px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-paper)",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink-primary)" }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              border: "1.5px solid var(--accent-red)",
              color: "var(--accent-red)",
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            研
          </span>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600 }}>
            研迹 ResearchTrace
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="kicker" style={{ color: "var(--ink-tertiary)" }}>
            #{id}
          </span>
          <PrefSwitcher />
        </div>
      </header>

      {/* Main excerpt */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "56px 48px 40px" }}>
        {/* Masthead-like brief header */}
        <div style={{ position: "relative", borderBottom: "3px double var(--divider-strong)", paddingBottom: 28, marginBottom: 36 }}>
          <div className="kicker-red" style={{ marginBottom: 12 }}>{t("share.kicker")}</div>
          <h1
            className="headline"
            style={{ fontSize: 38, margin: "0 0 14px", lineHeight: 1.18, maxWidth: 720 }}
          >
            {t("share.title")}
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: 17,
              fontStyle: "italic",
              color: "var(--ink-secondary)",
              margin: "0 0 18px",
              lineHeight: 1.55,
              maxWidth: 720,
            }}
          >
            {t("share.subtitle")}
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span className="kicker">{t("share.issue")}</span>
            <span style={{ width: 1, height: 12, background: "var(--divider-strong)" }} />
            <span
              className="font-serif"
              style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-secondary)" }}
            >
              {t("share.byline")}
            </span>
          </div>
          <div
            className="watermark-number"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -14,
              right: -10,
              fontSize: 130,
              color: "var(--accent-red)",
              opacity: 0.12,
              fontWeight: 700,
              lineHeight: 0.9,
              fontFamily: "var(--font-serif)",
              pointerEvents: "none",
            }}
          >
            {t("share.watermark")}
          </div>
        </div>

        {/* Lede */}
        <p
          className="font-serif"
          style={{ fontSize: 17, lineHeight: 1.7, color: "var(--ink-primary)", margin: "0 0 36px" }}
          dangerouslySetInnerHTML={{ __html: t.raw("share.lede.html") as string }}
        />

        {/* Section I */}
        <section style={{ marginBottom: 32 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 14 }}
          >
            <span className="kicker-red">{t("share.section.s1")}</span>
          </div>
          <p className="font-serif" style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 16px" }}>
            {t("share.p1")}
          </p>
          <p className="font-serif" style={{ fontSize: 15.5, lineHeight: 1.75, margin: 0 }}>
            {t("share.p2")}
          </p>
        </section>

        {/* Section II — claims with evidence */}
        <section style={{ marginBottom: 32 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 14 }}
          >
            <span className="kicker-red">{t("share.section.s2")}</span>
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {CLAIMS.map((n, idx) => (
              <li
                key={n}
                className="paper-card"
                style={{
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <span
                  className="font-serif"
                  style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.45, marginBottom: 6 }}
                  >
                    {t(`share.claim.${n}`)}
                  </div>
                  <div
                    className="kicker"
                    style={{
                      fontStyle: "italic",
                      fontFamily: "var(--font-serif)",
                      fontSize: 12,
                      textTransform: "none",
                      letterSpacing: 0,
                      color: "var(--ink-tertiary)",
                    }}
                  >
                    {t("share.evidence.label")} · {t(`share.evidence.${EVIDENCE_SRC[idx]}`)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Section III — dialogue */}
        <section style={{ marginBottom: 40 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 14 }}
          >
            <span className="kicker-red">{t("share.section.s3")}</span>
          </div>
          <blockquote
            className="font-serif"
            style={{
              borderLeft: "3px solid var(--accent-red)",
              paddingLeft: 18,
              margin: 0,
              fontSize: 17,
              fontStyle: "italic",
              lineHeight: 1.65,
              color: "var(--ink-secondary)",
            }}
          >
            {t("share.claim.4")}
            <div
              className="kicker"
              style={{
                marginTop: 10,
                fontFamily: "var(--font-serif)",
                fontSize: 12,
                textTransform: "none",
                letterSpacing: 0,
                color: "var(--ink-tertiary)",
              }}
            >
              — {t("share.evidence.src4")}
            </div>
          </blockquote>
        </section>

        {/* Inline action bar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            paddingTop: 22,
            borderTop: "1px solid var(--divider)",
            marginBottom: 48,
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={handleCopy}
            style={copied ? { borderColor: "var(--accent-red)", color: "var(--accent-red)" } : undefined}
          >
            {copied ? t("share.actions.copied") : t("share.actions.copy")}
          </button>
          <button className="btn btn-ghost" onClick={() => toast(t("share.alert.save"))}>
            {t("share.actions.save")}
          </button>
          <Link
            href={`/briefs/${id}`}
            className="btn btn-ghost"
            style={{ textDecoration: "none" }}
          >
            {t("share.actions.open")}
          </Link>
          <span style={{ flex: 1 }} />
          <Link
            href={`/briefs/${id}`}
            className="font-mono"
            style={{
              fontSize: 11,
              color: "var(--accent-red)",
              textDecoration: "none",
              alignSelf: "center",
            }}
          >
            {t("share.actions.openOrigin")}
          </Link>
        </div>
      </main>

      {/* CTA strip */}
      <section
        style={{
          background: "var(--bg-sidebar)",
          color: "#fff",
          padding: "56px 48px",
          borderTop: "1px solid var(--rule-on-dark)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="kicker-red" style={{ color: "var(--accent-red-soft)", marginBottom: 12 }}>
            {t("share.cta.kicker")}
          </div>
          <h2
            className="font-serif"
            style={{ fontSize: 30, fontWeight: 700, margin: "0 0 12px", color: "#fff", lineHeight: 1.25 }}
          >
            {t("share.cta.headline")}
          </h2>
          <p
            className="font-serif"
            style={{
              fontSize: 15.5,
              fontStyle: "italic",
              color: "var(--ink-mute-on-dark)",
              margin: "0 0 24px",
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            {t("share.cta.lede")}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/signup" className="btn btn-red" style={{ textDecoration: "none" }}>
              {t("share.cta.btnTrial")}
            </Link>
            <Link
              href="/briefs"
              className="btn btn-ghost"
              style={{ textDecoration: "none", borderColor: "var(--rule-on-dark)", color: "#fff" }}
            >
              {t("share.cta.btnSample")}
            </Link>
          </div>
        </div>
        <div
          className="watermark-number"
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 18,
            right: 36,
            fontSize: 200,
            color: "var(--accent-red-soft)",
            opacity: 0.14,
            fontWeight: 700,
            lineHeight: 0.9,
            fontFamily: "var(--font-serif)",
            pointerEvents: "none",
          }}
        >
          {t("share.watermark")}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "26px 48px",
          background: "var(--bg-paper)",
          borderTop: "1px solid var(--divider)",
        }}
      >
        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            className="font-serif"
            style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-secondary)" }}
          >
            {t("share.footer.tagline")}
            <div className="kicker" style={{ marginTop: 4, color: "var(--ink-tertiary)" }}>
              {t("share.footer.by")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/briefs" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("share.footer.viewBriefs")}
            </Link>
            <Link href="/" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("share.footer.homepage")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
