import { useTranslations } from "next-intl";
import { PrefSwitcher } from "@/components/providers/pref-switcher";

/**
 * B1 sanity-check homepage.
 *
 * Proves end-to-end that:
 *   - design tokens from globals.css render correctly (paper bg, ink type)
 *   - next/font wires up Source Serif 4 / Inter / JetBrains Mono
 *   - next-intl resolves messages from messages/<locale>.json (1004 keys)
 *   - next-themes flips data-theme="dark" without flicker
 *   - the PrefSwitcher round-trips through the server action
 *
 * This page is intentionally minimal — the production homepage that
 * 1:1 reproduces legacy/prototype-v0.3/index.html lands in B3+.
 */
export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen px-8 py-16">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Top strip — language / theme switcher */}
        <div className="flex items-center justify-between">
          <span className="kicker-red">VOL. IV · NEXT.JS · B1</span>
          <PrefSwitcher />
        </div>

        {/* Masthead */}
        <header className="border-b border-divider pb-8">
          <h1
            className="headline"
            style={{ fontSize: "var(--size-display)", marginBottom: 12 }}
          >
            研迹 ResearchTrace
          </h1>
          <p
            className="font-serif"
            style={{
              fontStyle: "italic",
              fontSize: 18,
              color: "var(--ink-secondary)",
              margin: 0,
            }}
          >
            A Paper for One Reader. You.
          </p>
        </header>

        {/* Bootstrap status */}
        <section className="space-y-4">
          <div className="rule-kicker">
            <span className="kicker-red">B1 · BOOTSTRAP STATUS</span>
          </div>

          <ul
            className="font-serif"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {[
              ["Step 0", "Legacy prototype v0.3 frozen in /legacy"],
              ["Step 1", "Next.js 16 + React 19 + Tailwind v4 scaffolded"],
              ["Step 2", "Design tokens migrated 1:1 from tokens.css"],
              ["Step 3", "1004 i18n keys loaded via next-intl"],
            ].map(([k, v]) => (
              <li
                key={k}
                className="leader"
                style={{ padding: "10px 0", borderBottom: "1px dotted var(--divider)" }}
              >
                <span className="kicker" style={{ minWidth: 70 }}>
                  {k}
                </span>
                <span style={{ flex: 1, fontSize: 15 }}>{v}</span>
                <span className="dots" />
                <span className="font-mono" style={{ fontSize: 12, color: "var(--success-green)" }}>
                  ✓ DONE
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sample i18n strings — proves dictionary is wired */}
        <section className="space-y-3">
          <div className="rule-kicker">
            <span className="kicker-red">SAMPLE · DICTIONARY ROUND-TRIP</span>
          </div>
          <p className="font-serif" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <span className="kicker">{t("nav.today")}</span>
            {" / "}
            <span className="kicker">{t("nav.topics")}</span>
            {" / "}
            <span className="kicker">{t("nav.briefs")}</span>
            {" / "}
            <span className="kicker">{t("nav.ask")}</span>
          </p>
          <p
            className="font-serif"
            style={{ fontStyle: "italic", color: "var(--ink-secondary)", fontSize: 14 }}
          >
            {t("shell.search")}
          </p>
        </section>

        {/* Visual token sampler */}
        <section className="space-y-3">
          <div className="rule-kicker">
            <span className="kicker-red">SAMPLE · TOKEN PALETTE</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="pill">PILL</button>
            <button className="pill is-active">PILL · ACTIVE</button>
            <button className="pill pill-red">PILL · RED</button>
            <button className="btn">BUTTON</button>
            <button className="btn btn-ghost">BUTTON · GHOST</button>
            <button className="btn btn-red">BUTTON · RED</button>
          </div>
          <div className="paper-card" style={{ padding: 18 }}>
            <span className="kicker-red">CALLOUT</span>
            <div className="callout-brief" style={{ marginTop: 10 }}>
              <span className="label">EDITOR&apos;S BRIEF</span>
              这是 <em>callout-brief</em> 的样式预览，验证 serif italic、accent-red
              竖线、bg-callout 在 light / dark 双主题下都对齐 v0.3 原型。
            </div>
          </div>
          <div
            className="watermark-number"
            style={{ fontSize: 120, lineHeight: 0.85 }}
          >
            001
          </div>
        </section>

        <footer
          className="font-mono"
          style={{
            fontSize: 11,
            color: "var(--ink-tertiary)",
            paddingTop: 24,
            borderTop: "1px solid var(--divider)",
          }}
        >
          B1 SANITY-CHECK · Production homepage lands in Batch B3
        </footer>
      </div>
    </main>
  );
}
