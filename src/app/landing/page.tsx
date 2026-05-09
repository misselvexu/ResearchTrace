import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PrefSwitcher } from "@/components/providers/pref-switcher";

const HOW_TIMELINE = [
  { time: "23:14", actor: "YOU", solid: true, ink: true, tK: "landing.how.t1.title", bK: "landing.how.t1.body" },
  { time: "23:14:08", actor: "INGESTOR", solid: false, ink: false, tK: "landing.how.t2.title", bK: "landing.how.t2.body" },
  { time: "23:14:42", actor: "CURATOR", solid: false, ink: false, tK: "landing.how.t3.title", bK: "landing.how.t3.body" },
  { time: "23:15:11", actor: "RETRIEVER", solid: false, ink: false, tK: "landing.how.t4.title", bK: "landing.how.t4.body" },
  { time: "23:00", actor: "RADAR", solid: false, ink: false, tK: "landing.how.t5.title", bK: "landing.how.t5.body" },
  { time: "next-morning", actor: "REPORTER", solid: false, ink: false, tK: "landing.how.t6.title", bK: "landing.how.t6.body" },
  { time: "08:00", actor: "YOU", solid: true, ink: true, tK: "landing.how.t7.title", bK: "landing.how.t7.body" },
] as const;

const AGENTS = [
  { n: "01", name: "Ingestor", roleK: "landing.agents.01.role", bodyK: "landing.agents.01.body" },
  { n: "02", name: "Curator", roleK: "landing.agents.02.role", bodyK: "landing.agents.02.body" },
  { n: "03", name: "Retriever", roleK: "landing.agents.03.role", bodyK: "landing.agents.03.body" },
  { n: "04", name: "Radar", roleK: "landing.agents.04.role", bodyK: "landing.agents.04.body" },
  { n: "05", name: "Reporter", roleK: "landing.agents.05.role", bodyK: "landing.agents.05.body" },
] as const;

export default async function LandingPage() {
  const t = await getTranslations();

  return (
    <>
      {/* Top nav */}
      <header
        style={{
          background: "var(--bg-paper)",
          borderBottom: "1px solid var(--divider)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "18px 48px",
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <Link
            href="/landing"
            style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "var(--ink-primary)" }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                border: "1.5px solid var(--accent-red)",
                color: "var(--accent-red)",
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              研
            </span>
            <span>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, display: "block", lineHeight: 1 }}>
                研迹
              </span>
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: ".18em", color: "var(--ink-tertiary)" }}>
                RESEARCHTRACE
              </span>
            </span>
          </Link>
          <nav style={{ display: "flex", gap: 24, flex: 1, justifyContent: "center" }}>
            <a href="#why" style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)" }}>{t("landing.nav.why")}</a>
            <a href="#how" style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)" }}>{t("landing.nav.how")}</a>
            <a href="#agents" style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)" }}>{t("landing.nav.agents")}</a>
            <Link href="/pricing" style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)" }}>{t("landing.nav.pricing")}</Link>
            <Link href="/briefs" style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)" }}>{t("landing.nav.briefs")}</Link>
          </nav>
          <PrefSwitcher />
          <Link href="/onboarding" style={{ fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)" }}>
            {t("landing.nav.signin")}
          </Link>
          <Link href="/onboarding" className="btn btn-red" style={{ textDecoration: "none" }}>
            {t("landing.cta.trial")}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ borderBottom: "3px double var(--divider-strong)", background: "var(--bg-paper)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "54px 48px 36px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid var(--divider)",
              paddingBottom: 14,
              marginBottom: 36,
            }}
          >
            <span className="kicker">{t("landing.masthead.vol")}</span>
            <span className="kicker">{t("landing.masthead.est")}</span>
            <span className="kicker">{t("landing.masthead.price")}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 16 }}>{t("landing.hero.kicker")}</div>
              <h1
                className="headline"
                style={{ fontSize: 72, lineHeight: 0.98, letterSpacing: "-.02em", margin: "0 0 22px" }}
                dangerouslySetInnerHTML={{ __html: t.raw("landing.hero.title.html") as string }}
              />
              <p
                className="font-serif"
                style={{ fontSize: 19, lineHeight: 1.6, color: "var(--ink-secondary)", margin: "0 0 28px", maxWidth: 520 }}
                dangerouslySetInnerHTML={{ __html: t.raw("landing.hero.lede.html") as string }}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/onboarding" className="btn btn-red" style={{ fontSize: 13, padding: "12px 22px", textDecoration: "none" }}>
                  {t("landing.cta.trial")}
                </Link>
                <Link href="/today" className="btn btn-ghost" style={{ fontSize: 13, padding: "12px 22px", textDecoration: "none" }}>
                  {t("landing.cta.demo")}
                </Link>
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--divider)" }}>
                {([
                  ["landing.stats.evidence.n", "landing.stats.evidence"],
                  ["landing.stats.trace.n", "landing.stats.trace"],
                  ["landing.stats.data.n", "landing.stats.data"],
                  ["landing.stats.train.n", "landing.stats.train"],
                ] as const).map(([nK, lK]) => (
                  <div key={nK}>
                    <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, color: "var(--accent-red)", lineHeight: 1 }}>
                      {t(nK)}
                    </div>
                    <div className="kicker" style={{ fontSize: 9, marginTop: 4 }}>{t(lK)}</div>
                  </div>
                ))}
              </div>
            </div>

            <figure style={{ position: "relative", margin: 0 }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/3",
                  border: "1px solid var(--divider)",
                  background: "var(--bg-paper-warm)",
                }}
              >
                <Image src="/img/hero-graph.png" alt="" fill sizes="(max-width: 1280px) 50vw, 540px" style={{ objectFit: "cover" }} />
              </div>
              <figcaption
                className="font-serif"
                style={{ fontStyle: "italic", fontSize: 12, color: "var(--ink-secondary)", textAlign: "center", marginTop: 8 }}
              >
                {t("landing.hero.fig")}
              </figcaption>
              <span
                className="watermark-number"
                style={{ position: "absolute", top: -32, left: -24, fontSize: 140, opacity: 0.85 }}
              >
                001
              </span>
            </figure>
          </div>

          <div
            style={{
              marginTop: 42,
              paddingTop: 18,
              borderTop: "1px solid var(--divider)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="kicker">{t("landing.hero.users")}</span>
            <span className="font-mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--ink-secondary)" }}>
              DEEPMIND · ANTHROPIC · GOOGLE BRAIN · A16Z · BESSEMER · MIT MEDIA LAB · TSINGHUA AIR · OPEN SOURCE FELLOWS
            </span>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 48px" }}>
          <div className="rule-kicker">
            <span className="kicker-red">{t("landing.why.kicker")}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 48, alignItems: "start" }}>
            <div>
              <h2 className="headline" style={{ fontSize: 42, margin: "0 0 14px", lineHeight: 1.15 }}>
                {t("landing.why.headline")}
              </h2>
              <p className="font-serif" style={{ fontStyle: "italic", fontSize: 17, color: "var(--ink-secondary)", margin: 0 }}>
                {t("landing.why.sub")}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {(["01", "02", "03", "04"] as const).map((n) => (
                <article
                  key={n}
                  style={{ padding: "20px 22px", background: "var(--bg-card)", border: "1px solid var(--divider)" }}
                >
                  <div
                    className="font-serif"
                    style={{ fontSize: 36, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1, marginBottom: 8 }}
                  >
                    {n}
                  </div>
                  <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                    {t(`landing.why.${n}.title`)}
                  </div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-secondary)" }}
                    dangerouslySetInnerHTML={{ __html: t.raw(`landing.why.${n}.body.html`) as string }}
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        style={{ background: "var(--bg-paper-warm)", borderBottom: "1px solid var(--divider)" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 48px" }}>
          <div className="rule-kicker">
            <span className="kicker-red">{t("landing.how.kicker")}</span>
          </div>
          <h2 className="headline" style={{ fontSize: 38, margin: "0 0 32px" }}>
            {t("landing.how.headline")}
          </h2>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 36,
                top: 30,
                bottom: 30,
                width: 1,
                background: "var(--divider-strong)",
                borderLeft: "1px dotted var(--divider-strong)",
              }}
            />
            {HOW_TIMELINE.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 28px 130px 1fr",
                  gap: 14,
                  alignItems: "flex-start",
                  padding: "14px 0",
                  position: "relative",
                }}
              >
                <span
                  className="font-mono"
                  style={{ fontSize: 12, color: "var(--accent-red)", textAlign: "right", fontWeight: 600 }}
                >
                  {row.time === "next-morning" ? t("landing.how.t.next") : row.time}
                </span>
                <span
                  style={{
                    position: "relative",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: row.ink ? "var(--ink-primary)" : "var(--accent-red)",
                    border: "3px solid var(--bg-paper-warm)",
                    marginTop: 2,
                    justifySelf: "center",
                  }}
                />
                <span
                  className={row.solid ? "pill pill-solid" : "pill pill-red"}
                  style={{ justifySelf: "start", fontSize: 9 }}
                >
                  {row.actor}
                </span>
                <div>
                  <div className="font-serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>
                    {t(row.tK)}
                  </div>
                  <div className="font-serif" style={{ fontStyle: "italic", fontSize: 13.5, color: "var(--ink-secondary)" }}>
                    {t(row.bK)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 48px" }}>
          <div className="rule-kicker">
            <span className="kicker-red">{t("landing.agents.kicker")}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 48, alignItems: "center" }}>
            <div>
              <h2 className="headline" style={{ fontSize: 38, margin: "0 0 12px", lineHeight: 1.15 }}>
                {t("landing.agents.headline")}
              </h2>
              <p className="font-serif" style={{ fontStyle: "italic", fontSize: 16, color: "var(--ink-secondary)", margin: "0 0 18px" }}>
                {t("landing.agents.lede")}
              </p>
              <Link href="/settings#agents" className="btn btn-ghost" style={{ textDecoration: "none" }}>
                {t("landing.agents.cta")}
              </Link>
            </div>
            <figure style={{ margin: 0, position: "relative", width: "100%", aspectRatio: "16/9" }}>
              <Image
                src="/img/agents-diagram.png"
                alt=""
                fill
                sizes="(max-width: 1280px) 60vw, 720px"
                style={{
                  objectFit: "contain",
                  border: "1px solid var(--divider)",
                  background: "var(--bg-paper-warm)",
                }}
              />
            </figure>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginTop: 36 }}>
            {AGENTS.map((a) => (
              <article key={a.n} className="paper-card" style={{ padding: "20px 18px", textAlign: "center" }}>
                <div
                  className="font-serif"
                  style={{ fontSize: 36, fontWeight: 700, color: "var(--accent-red)", lineHeight: 1, marginBottom: 6 }}
                >
                  {a.n}
                </div>
                <div className="font-serif" style={{ fontSize: 18, fontWeight: 600 }}>{a.name}</div>
                <div
                  className="kicker"
                  style={{
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    fontSize: 12,
                    textTransform: "none",
                    letterSpacing: 0,
                    color: "var(--ink-secondary)",
                    margin: "2px 0 10px",
                  }}
                >
                  {t(a.roleK)}
                </div>
                <div className="font-serif" style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-secondary)" }}>
                  {t(a.bodyK)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sample brief teaser */}
      <section
        style={{
          background: "var(--bg-sidebar)",
          color: "var(--ink-inverse)",
          borderBottom: "1px solid var(--rule-on-dark)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "64px 48px",
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div className="kicker-red" style={{ marginBottom: 14 }}>{t("landing.sample.kicker")}</div>
            <h2 className="headline" style={{ fontSize: 38, color: "#fff", margin: "0 0 16px" }}>
              {t("landing.sample.headline")}
            </h2>
            <p
              className="font-serif"
              style={{ fontSize: 16, color: "var(--ink-mute-on-dark)", lineHeight: 1.7, margin: "0 0 22px" }}
              dangerouslySetInnerHTML={{ __html: t.raw("landing.sample.body.html") as string }}
            />
            <Link href="/briefs/127" className="btn btn-red" style={{ textDecoration: "none" }}>
              {t("landing.sample.cta")}
            </Link>
          </div>
          <figure style={{ margin: 0, position: "relative" }}>
            <Link href="/briefs/127" style={{ display: "block", textDecoration: "none" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/3",
                  border: "1px solid var(--rule-on-dark)",
                  background: "var(--bg-paper-warm)",
                }}
              >
                <Image
                  src="/img/thumb-longctx.png"
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 55vw, 640px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span
                className="watermark-number"
                style={{ position: "absolute", top: -24, left: -16, fontSize: 130, color: "var(--accent-red)" }}
              >
                127
              </span>
            </Link>
          </figure>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <div className="kicker-red" style={{ marginBottom: 14 }}>{t("landing.cta.last")}</div>
          <h2
            className="headline"
            style={{ fontSize: 50, margin: "0 0 18px", lineHeight: 1.08 }}
            dangerouslySetInnerHTML={{ __html: t.raw("landing.cta.title.html") as string }}
          />
          <p
            className="font-serif"
            style={{ fontStyle: "italic", fontSize: 17, color: "var(--ink-secondary)", maxWidth: 580, margin: "0 auto 28px" }}
          >
            {t("landing.cta.body")}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <Link href="/onboarding" className="btn btn-red" style={{ fontSize: 14, padding: "14px 28px", textDecoration: "none" }}>
              {t("landing.cta.trial.short")}
            </Link>
            <Link href="/pricing" className="btn btn-ghost" style={{ fontSize: 14, padding: "14px 28px", textDecoration: "none" }}>
              {t("landing.cta.compare")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--bg-paper)" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "42px 48px 24px",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 32,
            borderTop: "3px double var(--divider-strong)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
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
                }}
              >
                研
              </span>
              <span className="font-serif" style={{ fontSize: 18, fontWeight: 600 }}>研迹 ResearchTrace</span>
            </div>
            <div
              className="font-serif"
              style={{ fontStyle: "italic", fontSize: 13.5, color: "var(--ink-secondary)", maxWidth: 340, lineHeight: 1.6 }}
            >
              {t("landing.footer.tagline")}
            </div>
          </div>
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>{t("landing.footer.col1")}</div>
            {[
              ["/today", "Today"],
              ["/topics", "Topics"],
              ["/ask", "Ask"],
              ["/briefs", "Briefs"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                style={{ display: "block", fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)", marginBottom: 4 }}
              >
                {label}
              </Link>
            ))}
          </div>
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>{t("landing.footer.col2")}</div>
            {[
              ["/inbox", "Inbox"],
              ["/onboarding", "Onboarding"],
              ["/settings", "Settings"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                style={{ display: "block", fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)", marginBottom: 4 }}
              >
                {label}
              </Link>
            ))}
          </div>
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>{t("landing.footer.col3")}</div>
            <Link
              href="/pricing"
              style={{ display: "block", fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)", marginBottom: 4 }}
            >
              {t("landing.nav.pricing")}
            </Link>
            <a href="#" style={{ display: "block", fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)", marginBottom: 4 }}>
              {t("landing.footer.edu")}
            </a>
            <a href="#" style={{ display: "block", fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)", marginBottom: 4 }}>
              {t("landing.footer.team")}
            </a>
          </div>
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>{t("landing.footer.col4")}</div>
            {(["about", "blog", "privacy", "terms"] as const).map((k) => (
              <a
                key={k}
                href="#"
                style={{ display: "block", fontSize: 13, textDecoration: "none", color: "var(--ink-secondary)", marginBottom: 4 }}
              >
                {t(`landing.footer.${k}`)}
              </a>
            ))}
          </div>
        </div>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "14px 48px 28px",
            display: "flex",
            justifyContent: "space-between",
            color: "var(--ink-tertiary)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: ".14em",
          }}
        >
          <span>© 2026 RESEARCHTRACE LABS · BEIJING / SAN FRANCISCO</span>
          <span>BUILT WITH INK &amp; PAPER · v0.4.0-PROTOTYPE</span>
        </div>
      </footer>
    </>
  );
}
