"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/shell/public-shell";

const SECTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

// Sections that have multiple paragraphs (p1/p2/p3)
const SECTION_PARAS: Record<string, string[]> = {
  "1": ["p1", "p2", "p3"],
  "2": ["p1", "p2"],
  "3": ["p1", "p2"],
  "4": ["p1", "p2"],
  "5": ["p1", "p2"],
  "6": ["p1", "p2"],
  "7": ["p1"],
  "8": ["p1", "p2"],
  "9": ["p1"],
};

export default function PrivacyPage() {
  const t = useTranslations();

  return (
    <PublicShell crumb={t("legal.privacy.crumb")}>
      <main
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "32px 48px 8px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 48,
        }}
      >
        {/* TOC sidebar */}
        <aside style={{ position: "sticky", top: 96, alignSelf: "start" }}>
          <div
            className="kicker-red"
            style={{ marginBottom: 12, fontSize: 11, letterSpacing: "0.14em" }}
          >
            {t("legal.common.toc")}
          </div>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              borderLeft: "1px solid var(--divider-strong)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {SECTIONS.map((s) => (
              <li key={s}>
                <a
                  href={`#${t(`legal.privacy.s.${s}.id`)}`}
                  className="font-serif"
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "var(--ink-secondary)",
                    textDecoration: "none",
                    padding: "4px 14px",
                    lineHeight: 1.45,
                  }}
                >
                  {t(`legal.privacy.s.${s}.title`)}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        {/* Body */}
        <article>
          {/* Masthead */}
          <div style={{ position: "relative", borderBottom: "3px double var(--divider-strong)", paddingBottom: 24, marginBottom: 32 }}>
            <div className="kicker-red" style={{ marginBottom: 12 }}>
              {t("legal.privacy.kicker")}
            </div>
            <h1
              className="headline"
              style={{ fontSize: 38, margin: "0 0 14px", lineHeight: 1.18, maxWidth: 640 }}
            >
              {t("legal.privacy.title")}
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: 17,
                fontStyle: "italic",
                color: "var(--ink-secondary)",
                margin: "0 0 14px",
                lineHeight: 1.55,
                maxWidth: 640,
              }}
            >
              {t("legal.privacy.subtitle")}
            </p>
            <div className="kicker" style={{ color: "var(--ink-tertiary)", fontSize: 11, letterSpacing: "0.12em" }}>
              {t("legal.common.footer.lastUpdated")} · {t("legal.privacy.lastUpdated")}
            </div>
            <div
              className="watermark-number"
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -12,
                right: -8,
                fontSize: 140,
                color: "var(--accent-red)",
                opacity: 0.12,
                fontWeight: 700,
                lineHeight: 0.9,
                fontFamily: "var(--font-serif)",
                pointerEvents: "none",
              }}
            >
              {t("legal.privacy.watermark")}
            </div>
          </div>

          {/* Intro */}
          <p
            className="font-serif"
            style={{ fontSize: 16, lineHeight: 1.75, color: "var(--ink-primary)", margin: "0 0 32px" }}
            dangerouslySetInnerHTML={{ __html: t.raw("legal.privacy.intro.html") as string }}
          />

          {/* Sections */}
          {SECTIONS.map((s) => {
            const id = t(`legal.privacy.s.${s}.id`);
            const paras = SECTION_PARAS[s] ?? ["p1"];
            return (
              <section key={s} id={id} style={{ marginBottom: 36, scrollMarginTop: 96 }}>
                <h2
                  className="font-serif"
                  style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.35 }}
                >
                  {t(`legal.privacy.s.${s}.title`)}
                </h2>
                {paras.map((pk, idx) => (
                  <p
                    key={pk}
                    className="font-serif"
                    style={{
                      fontSize: 15.5,
                      lineHeight: 1.75,
                      margin: idx === paras.length - 1 ? 0 : "0 0 12px",
                    }}
                    dangerouslySetInnerHTML={{ __html: t.raw(`legal.privacy.s.${s}.${pk}`) as string }}
                  />
                ))}
              </section>
            );
          })}

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid var(--divider)",
              paddingTop: 22,
              marginTop: 24,
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div
              className="kicker"
              style={{ color: "var(--ink-tertiary)", fontSize: 11, letterSpacing: "0.12em" }}
            >
              {t("legal.common.footer.contact")} ·{" "}
              <a
                href={`mailto:${t("legal.common.footer.email")}`}
                className="font-mono"
                style={{ color: "var(--accent-red)", textDecoration: "none" }}
              >
                {t("legal.common.footer.email")}
              </a>
            </div>
            <Link
              href="/legal/terms"
              className="link-red"
              style={{ textDecoration: "none", fontSize: 13 }}
            >
              ← {t("publicShell.footer.links.terms")}
            </Link>
          </div>
        </article>
      </main>
    </PublicShell>
  );
}
