"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/shell/public-shell";

const PRINCIPLES = ["p1", "p2", "p3", "p4"] as const;
const TIMELINE = ["t1", "t2", "t3", "t4", "t5", "t6"] as const;
const TEAM = ["1", "2", "3"] as const;

export default function AboutPage() {
  const t = useTranslations();

  return (
    <PublicShell activeNav="about" crumb={t("about.crumb")}>
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 48px 8px" }}>
        {/* Masthead */}
        <div style={{ position: "relative", borderBottom: "3px double var(--divider-strong)", paddingBottom: 28, marginBottom: 36 }}>
          <div className="kicker-red" style={{ marginBottom: 12 }}>
            {t("about.kicker")}
          </div>
          <h1
            className="headline"
            style={{ fontSize: 44, margin: "0 0 14px", lineHeight: 1.15, maxWidth: 720 }}
          >
            {t("about.title")}
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--ink-secondary)",
              margin: 0,
              lineHeight: 1.55,
              maxWidth: 720,
            }}
          >
            {t("about.subtitle")}
          </p>
          <div
            className="watermark-number"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -10,
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
            {t("about.watermark")}
          </div>
        </div>

        {/* Lede */}
        <p
          className="font-serif"
          style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink-primary)", margin: "0 0 44px" }}
          dangerouslySetInnerHTML={{ __html: t.raw("about.lede.html") as string }}
        />

        {/* §I Mission */}
        <section style={{ marginBottom: 44 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 18 }}
          >
            <span className="kicker-red">{t("about.section.mission")}</span>
          </div>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.3 }}>
            {t("about.mission.headline")}
          </h2>
          <p
            className="font-serif"
            style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 14px" }}
            dangerouslySetInnerHTML={{ __html: t.raw("about.mission.p1") as string }}
          />
          <p
            className="font-serif"
            style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 14px" }}
            dangerouslySetInnerHTML={{ __html: t.raw("about.mission.p2") as string }}
          />
          <p
            className="font-serif"
            style={{ fontSize: 15.5, lineHeight: 1.75, margin: 0 }}
            dangerouslySetInnerHTML={{ __html: t.raw("about.mission.p3") as string }}
          />
        </section>

        {/* §II Story */}
        <section style={{ marginBottom: 44 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 18 }}
          >
            <span className="kicker-red">{t("about.section.story")}</span>
          </div>
          <p className="font-serif" style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 14px" }}>
            {t("about.story.p1")}
          </p>
          <p className="font-serif" style={{ fontSize: 15.5, lineHeight: 1.75, margin: 0 }}>
            {t("about.story.p2")}
          </p>
        </section>

        {/* §III Principles */}
        <section style={{ marginBottom: 44 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 18 }}
          >
            <span className="kicker-red">{t("about.section.principles")}</span>
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {PRINCIPLES.map((p) => (
              <li
                key={p}
                className="paper-card"
                style={{ padding: "20px 22px", display: "grid", gridTemplateColumns: "44px 1fr", gap: 16 }}
              >
                <span
                  className="font-serif"
                  style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}
                >
                  {t(`about.principles.${p}.n`)}
                </span>
                <div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}
                  >
                    {t(`about.principles.${p}.k`)}
                  </div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-secondary)" }}
                  >
                    {t(`about.principles.${p}.v`)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* §IV Timeline */}
        <section style={{ marginBottom: 44 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 18 }}
          >
            <span className="kicker-red">{t("about.section.timeline")}</span>
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 0 }}>
            {TIMELINE.map((tk, i) => (
              <li
                key={tk}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 24,
                  padding: "16px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--divider)",
                }}
              >
                <div
                  className="font-mono"
                  style={{ fontSize: 12, color: "var(--accent-red)", fontWeight: 600, paddingTop: 2 }}
                >
                  {t(`about.timeline.${tk}.d`)}
                </div>
                <div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, lineHeight: 1.4 }}
                  >
                    {t(`about.timeline.${tk}.k`)}
                  </div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-secondary)" }}
                  >
                    {t(`about.timeline.${tk}.v`)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* §V Team */}
        <section style={{ marginBottom: 44 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 18 }}
          >
            <span className="kicker-red">{t("about.section.team")}</span>
          </div>
          <p
            className="font-serif"
            style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 22px", color: "var(--ink-secondary)", fontStyle: "italic" }}
          >
            {t("about.team.lede")}
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {TEAM.map((id) => (
              <li
                key={id}
                className="paper-card"
                style={{ padding: "22px 20px", textAlign: "center" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "var(--bg-paper-warm)",
                    border: "1.5px solid var(--accent-red)",
                    color: "var(--accent-red)",
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: 22,
                    margin: "0 auto 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {(t(`about.team.people.${id}.n`) as string).slice(0, 1)}
                </div>
                <div className="font-serif" style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                  {t(`about.team.people.${id}.n`)}
                </div>
                <div
                  className="kicker"
                  style={{ fontSize: 11, color: "var(--ink-tertiary)", letterSpacing: "0.08em" }}
                >
                  {t(`about.team.people.${id}.r`)}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* §VI Contact */}
        <section style={{ marginBottom: 32 }}>
          <div
            className="rule-kicker"
            style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 18 }}
          >
            <span className="kicker-red">{t("about.section.contact")}</span>
          </div>
          <p className="font-serif" style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 12px" }}>
            {t("about.contact.lede")}
          </p>
          <a
            href={`mailto:${t("about.contact.email")}`}
            className="font-mono"
            style={{ fontSize: 15, color: "var(--accent-red)", textDecoration: "none", fontWeight: 600 }}
          >
            {t("about.contact.email")}
          </a>
          <div className="kicker" style={{ marginTop: 8, color: "var(--ink-tertiary)", fontSize: 11 }}>
            {t("about.contact.hint")}
          </div>
        </section>
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
        <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="kicker-red" style={{ color: "var(--accent-red-soft)", marginBottom: 12 }}>
            {t("about.cta.kicker")}
          </div>
          <h2
            className="font-serif"
            style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px", color: "#fff", lineHeight: 1.25 }}
          >
            {t("about.cta.headline")}
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
            {t("about.cta.lede")}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/signup" className="btn btn-red" style={{ textDecoration: "none" }}>
              {t("about.cta.btnTrial")}
            </Link>
            <Link
              href="/briefs"
              className="btn btn-ghost"
              style={{ textDecoration: "none", borderColor: "var(--rule-on-dark)", color: "#fff" }}
            >
              {t("about.cta.btnSample")}
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
          {t("about.watermark")}
        </div>
      </section>
    </PublicShell>
  );
}
