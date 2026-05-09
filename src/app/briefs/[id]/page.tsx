import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppLayout } from "@/components/shell/app-layout";
import { PrintButton } from "./print-button";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"] as const;

type Params = { id: string };

export default async function BriefDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const t = await getTranslations();

  // Compute previous id (legacy hardcoded "126" for default; clamp to >= 0)
  const idNum = Number.parseInt(id, 10);
  const prevId = Number.isFinite(idNum) && idNum > 1 ? String(idNum - 1) : "126";

  const TOC = [1, 2, 3, 4, 5, 6] as const;
  const SUBSECTIONS = [
    { n: "01", tK: "brief.s2.h1.t", dK: "brief.s2.h1.d", href: "/topic?t=llm-longctx&claim=rmt-v3" },
    { n: "02", tK: "brief.s2.h2.t", dK: "brief.s2.h2.d", href: "/topic?t=llm-longctx&claim=claude-needle" },
    { n: "03", tK: "brief.s2.h3.t", dK: "brief.s2.h3.d", href: "/topic?t=rag&item=graphrag" },
  ];

  return (
    <AppLayout activeId="briefs" crumbKey="brief.crumb">
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 48px 80px" }}>
        {/* Header */}
        <header
          style={{
            borderBottom: "3px double var(--divider-strong)",
            paddingBottom: 28,
            marginBottom: 36,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div className="kicker-red" style={{ marginBottom: 14 }}>{t("brief.kicker")} {id}</div>
              <h1 className="headline" style={{ fontSize: 42, margin: "0 0 12px", lineHeight: 1.15 }}>
                {t("brief.title")}
              </h1>
              <p className="font-serif" style={{ fontStyle: "italic", fontSize: 17, color: "var(--ink-secondary)", margin: 0 }}>
                {t("brief.subtitle")}
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 18, alignItems: "center", flexWrap: "wrap" }}>
                <span className="kicker">{t("brief.delivered")}</span>
                <span className="kicker">·</span>
                <span className="kicker">{t("brief.topic")}</span>
                <span className="kicker">·</span>
                <span className="kicker">{t("brief.editor")}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", marginLeft: 24 }}>
              <div className="watermark-number" style={{ fontSize: 108 }}>{id}</div>
            </div>
          </div>
          <BriefHeaderActions />
        </header>

        {/* TOC */}
        <section
          style={{
            marginBottom: 36,
            padding: "20px 24px",
            background: "var(--bg-paper-warm)",
            border: "1px solid var(--divider)",
          }}
        >
          <div className="kicker-red" style={{ marginBottom: 12 }}>{t("brief.toc")}</div>
          {TOC.map((i) => (
            <a
              key={i}
              href={`#sec-${i - 1}`}
              className="leader"
              style={{ textDecoration: "none", color: "var(--ink-primary)", padding: "5px 0" }}
            >
              <span className="font-mono" style={{ fontSize: 11, color: "var(--accent-red)" }}>§ {ROMAN[i - 1]}</span>
              <span className="font-serif" style={{ fontSize: 14.5 }}>{t(`brief.toc.${i}`)}</span>
              <span className="dots" />
              <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-tertiary)" }}>P. {i * 2}</span>
            </a>
          ))}
        </section>

        {/* §1 — Editor's brief */}
        <section id="sec-0" style={{ marginBottom: 40 }}>
          <div className="rule-kicker"><span className="kicker-red">{t("brief.s1.kicker")}</span></div>
          <div className="callout-brief">
            <span className="label">{t("brief.s1.label")}</span>
            <span dangerouslySetInnerHTML={{ __html: t.raw("brief.s1.body.html") as string }} />
          </div>
        </section>

        {/* §2 — Headlines */}
        <section id="sec-1" style={{ marginBottom: 40 }}>
          <div className="rule-kicker"><span className="kicker-red">{t("brief.s2.kicker")}</span></div>
          {SUBSECTIONS.map((s) => (
            <Link
              key={s.n}
              href={s.href}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr",
                gap: 18,
                padding: "14px 0",
                borderBottom: "1px solid var(--divider)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1 }}>
                {s.n}
              </div>
              <div>
                <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
                  {t(s.tK)}
                </div>
                <div className="font-serif" style={{ fontStyle: "italic", fontSize: 14.5, color: "var(--ink-secondary)" }}>
                  {t(s.dK)}
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* §3 — Curator essay */}
        <section id="sec-2" style={{ marginBottom: 40 }}>
          <div className="rule-kicker"><span className="kicker-red">{t("brief.s3.kicker")}</span></div>
          <p
            className="font-serif dropcap"
            style={{ fontSize: 17, lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: t.raw("brief.s3.p1.html") as string }}
          />
          <p
            className="font-serif"
            style={{ fontSize: 17, lineHeight: 1.85, marginTop: 14 }}
            dangerouslySetInnerHTML={{ __html: t.raw("brief.s3.p2.html") as string }}
          />

          <figure style={{ margin: "30px 0", padding: 20, background: "var(--bg-paper-warm)", border: "1px solid var(--divider)" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", border: "1px solid var(--divider)", background: "#fff" }}>
              <Image src="/img/agents-diagram.png" alt="" fill sizes="100vw" style={{ objectFit: "contain" }} />
            </div>
            <figcaption
              className="font-serif"
              style={{ fontStyle: "italic", fontSize: 13, color: "var(--ink-secondary)", marginTop: 10, textAlign: "center" }}
            >
              {t("brief.s3.fig")}
            </figcaption>
          </figure>
        </section>

        {/* §4 — Dialogue with past work */}
        <section id="sec-3" style={{ marginBottom: 40 }}>
          <div className="rule-kicker"><span className="kicker-red">{t("brief.s4.kicker")}</span></div>
          <p
            className="font-serif"
            style={{ fontSize: 17, lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: t.raw("brief.s4.p.html") as string }}
          />
          <div
            style={{
              marginTop: 18,
              padding: "14px 18px",
              background: "var(--bg-paper-warm)",
              borderLeft: "3px solid var(--success-green)",
            }}
          >
            <div className="kicker" style={{ color: "var(--success-green)", marginBottom: 6 }}>{t("brief.s4.callout")}</div>
            <div className="font-serif" style={{ fontStyle: "italic", fontSize: 15 }}>{t("brief.s4.callout.body")}</div>
          </div>
        </section>

        {/* §5 — Counter-perspective */}
        <section id="sec-4" style={{ marginBottom: 40 }}>
          <div className="rule-kicker"><span className="kicker-red">{t("brief.s5.kicker")}</span></div>
          <p
            className="font-serif"
            style={{ fontSize: 17, lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: t.raw("brief.s5.p1.html") as string }}
          />
          <p
            className="font-serif"
            style={{ fontSize: 17, lineHeight: 1.85, marginTop: 12 }}
            dangerouslySetInnerHTML={{ __html: t.raw("brief.s5.p2.html") as string }}
          />
        </section>

        {/* §6 — Next radar */}
        <section id="sec-5" style={{ marginBottom: 40 }}>
          <div className="rule-kicker"><span className="kicker-red">{t("brief.s6.kicker")}</span></div>
          <p className="font-serif" style={{ fontStyle: "italic", fontSize: 15.5, color: "var(--ink-secondary)", margin: "0 0 14px" }}>
            {t("brief.s6.intro")}
          </p>
          <ul style={{ fontFamily: "var(--font-serif)", fontSize: 16, lineHeight: 1.8, paddingLeft: 22, margin: 0 }}>
            <li>{t("brief.s6.l1")}</li>
            <li>{t("brief.s6.l2")}</li>
            <li>{t("brief.s6.l3")}</li>
            <li>{t("brief.s6.l4")}</li>
          </ul>
        </section>

        {/* Followups */}
        <section style={{ borderTop: "3px double var(--divider-strong)", paddingTop: 24, marginTop: 48 }}>
          <div className="kicker-red" style={{ marginBottom: 14 }}>{t("brief.followups")}</div>
          <BriefFollowups />
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: 60,
            paddingTop: 24,
            borderTop: "1px solid var(--divider)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div className="font-serif" style={{ fontStyle: "italic", fontSize: 14, color: "var(--ink-secondary)" }}>
              {t("brief.colophon.tagline")}
            </div>
            <div className="kicker" style={{ marginTop: 6 }}>{t("brief.colophon.byline")}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="kicker">{t("brief.prevnext")}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <Link href={`/briefs/${prevId}`} className="pill" style={{ textDecoration: "none" }}>
                ← No.{prevId}
              </Link>
              <Link href="/briefs" className="pill" style={{ textDecoration: "none" }}>
                {t("brief.btn.library2")}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}

/* Client islands (need handlers / window.print) */

import { BriefHeaderActionsClient, BriefFollowupsClient } from "./client-actions";

function BriefHeaderActions() {
  return <BriefHeaderActionsClient PrintButton={<PrintButton />} />;
}

function BriefFollowups() {
  return <BriefFollowupsClient />;
}
