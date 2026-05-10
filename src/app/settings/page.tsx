"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type SectionId = "profile" | "delivery" | "agents" | "sources" | "plan" | "data";

const SECTIONS: { id: SectionId; labelK: string }[] = [
  { id: "profile", labelK: "settings.nav.profile" },
  { id: "delivery", labelK: "settings.nav.delivery" },
  { id: "agents", labelK: "settings.nav.agents" },
  { id: "sources", labelK: "settings.nav.sources" },
  { id: "plan", labelK: "settings.nav.plan" },
  { id: "data", labelK: "settings.nav.data" },
];

const PROFILE_FIELDS: [string, string][] = [
  ["settings.profile.k1", "settings.profile.v1"],
  ["settings.profile.k2", "settings.profile.v2"],
  ["settings.profile.k3", "settings.profile.v3"],
  ["settings.profile.k4", "settings.profile.v4"],
  ["settings.profile.k5", "settings.profile.v5"],
  ["settings.profile.k6", "settings.profile.v6"],
];

const CADENCE_ROWS: { kK: string; vK: string; defaultOn: boolean }[] = [
  { kK: "settings.delivery.r1.k", vK: "settings.delivery.r1.v", defaultOn: true },
  { kK: "settings.delivery.r2.k", vK: "settings.delivery.r2.v", defaultOn: true },
  { kK: "settings.delivery.r3.k", vK: "settings.delivery.r3.v", defaultOn: true },
  { kK: "settings.delivery.r4.k", vK: "settings.delivery.r4.v", defaultOn: true },
  { kK: "settings.delivery.r5.k", vK: "settings.delivery.r5.v", defaultOn: false },
];

const CHANNEL_KEYS = ["app", "email", "rss", "wechat", "slack", "tg"] as const;
const CHANNEL_DEFAULT_ACTIVE: Record<(typeof CHANNEL_KEYS)[number], boolean> = {
  app: true,
  email: true,
  rss: false,
  wechat: false,
  slack: false,
  tg: false,
};

const AGENTS = [
  { n: "Ingestor", zhK: "settings.agents.a1.zh", dK: "settings.agents.a1.d", lastK: "settings.agents.a1.last", calls: "127/today" },
  { n: "Curator", zhK: "settings.agents.a2.zh", dK: "settings.agents.a2.d", lastK: "settings.agents.a2.last", calls: "38/today" },
  { n: "Retriever", zhK: "settings.agents.a3.zh", dK: "settings.agents.a3.d", lastK: "settings.agents.a3.last", calls: "412/today" },
  { n: "Radar", zhK: "settings.agents.a4.zh", dK: "settings.agents.a4.d", lastK: "settings.agents.a4.last", calls: "9 sources" },
  { n: "Reporter", zhK: "settings.agents.a5.zh", dK: "settings.agents.a5.d", lastK: "settings.agents.a5.last", calls: "3 briefs" },
];

const ROUTING: [string, string][] = [
  ["settings.agents.r1.k", "Claude 3.5 Sonnet"],
  ["settings.agents.r2.k", "GPT-4o-mini"],
  ["settings.agents.r3.k", "Gemini 2.5 Pro"],
];

const PLAN_STATS: [string, string][] = [
  ["VAULT", "2,438 / ∞"],
  ["AGENT CALLS", "580 / 5,000 today"],
  ["TOPICS", "12 / ∞"],
  ["DEEP DIVES", "6 / 20 monthly"],
];

const DATA_ROWS: { kK: string; dK: string; ctaK: string; danger: boolean }[] = [
  { kK: "settings.data.r1.k", dK: "settings.data.r1.d", ctaK: "settings.data.r1.cta", danger: false },
  { kK: "settings.data.r2.k", dK: "settings.data.r2.d", ctaK: "settings.data.r2.cta", danger: true },
  { kK: "settings.data.r3.k", dK: "settings.data.r3.d", ctaK: "settings.data.r3.cta", danger: false },
  { kK: "settings.data.r4.k", dK: "settings.data.r4.d", ctaK: "settings.data.r4.cta", danger: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        width: 42,
        height: 22,
        borderRadius: 11,
        background: on ? "var(--accent-red)" : "var(--divider-strong)",
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "all .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 22 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .2s",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();

  const [cadence, setCadence] = useState<boolean[]>(CADENCE_ROWS.map((r) => r.defaultOn));
  const [channels, setChannels] = useState<Record<(typeof CHANNEL_KEYS)[number], boolean>>({
    ...CHANNEL_DEFAULT_ACTIVE,
  });

  function handleLogout() {
    if (confirm(t("common.confirmLogout"))) router.push("/landing");
  }

  return (
    <AppLayout activeId="settings" crumbKey="settings.crumb">
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>
                {t("settings.kicker")}
              </div>
              <h1 className="headline" style={{ fontSize: 42, margin: 0 }}>
                {t("settings.title")}
              </h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0" }}
              >
                {t("settings.lede")}
              </p>
            </div>
            <div className="watermark-number" style={{ fontSize: 88, opacity: 0.85 }}>
              06
            </div>
          </div>
        </div>
      </section>

      <section>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "32px 48px 64px",
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 48,
          }}
        >
          {/* Settings nav */}
          <aside style={{ position: "sticky", top: 88, alignSelf: "start" }}>
            {SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="leader"
                style={{
                  textDecoration: "none",
                  color: i === 0 ? "var(--accent-red)" : "var(--ink-secondary)",
                  padding: "6px 0",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                }}
              >
                <span className="font-mono" style={{ fontSize: 10 }}>
                  0{i + 1}
                </span>
                <span className="font-serif" style={{ fontSize: 14 }}>
                  {t(s.labelK)}
                </span>
              </a>
            ))}
            <button
              type="button"
              className="btn btn-ghost"
              style={{
                marginTop: 24,
                width: "100%",
                justifyContent: "center",
                fontSize: 10,
              }}
              onClick={handleLogout}
            >
              {t("settings.btn.logout")}
            </button>
          </aside>

          <div>
            {/* Profile */}
            <section id="profile" style={{ marginBottom: 48 }}>
              <div className="rule-kicker">
                <span className="kicker-red">{t("settings.profile.kicker")}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 32 }}>
                <div style={{ textAlign: "center" }}>
                  <Image
                    src="/img/avatar.png"
                    alt=""
                    width={120}
                    height={120}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      border: "1px solid var(--divider)",
                      objectFit: "cover",
                      background: "var(--bg-paper-warm)",
                    }}
                  />
                  <button
                    type="button"
                    className="pill"
                    style={{ marginTop: 10, fontSize: 9 }}
                    onClick={() => toast(t("settings.profile.alert"))}
                  >
                    {t("settings.profile.change")}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {PROFILE_FIELDS.map(([kK, vK]) => (
                    <div key={kK}>
                      <div className="kicker" style={{ fontSize: 9, marginBottom: 4 }}>
                        {t(kK)}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 15,
                          padding: "8px 12px",
                          border: "1px solid var(--divider)",
                          background: "var(--bg-card)",
                        }}
                      >
                        {t(vK)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section id="delivery" style={{ marginBottom: 48 }}>
              <div className="rule-kicker">
                <span className="kicker-red">{t("settings.delivery.kicker")}</span>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>
                  {t("settings.delivery.cadence")}
                </div>
                {CADENCE_ROWS.map((r, i) => (
                  <div
                    key={r.kK}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderBottom: "1px dotted var(--divider)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="font-serif" style={{ fontSize: 15, fontWeight: 500 }}>
                        {t(r.kK)}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: 11,
                          color: "var(--ink-secondary)",
                          marginTop: 2,
                        }}
                      >
                        {t(r.vK)}
                      </div>
                    </div>
                    <Toggle
                      on={cadence[i]}
                      onChange={(v) =>
                        setCadence((arr) => {
                          const next = [...arr];
                          next[i] = v;
                          return next;
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="kicker" style={{ marginBottom: 10 }}>
                  {t("settings.delivery.channels")}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CHANNEL_KEYS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`pill ${channels[c] ? "is-active" : ""}`}
                      onClick={() => setChannels((prev) => ({ ...prev, [c]: !prev[c] }))}
                    >
                      {t(`settings.delivery.ch.${c}`)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Agents */}
            <section id="agents" style={{ marginBottom: 48 }}>
              <div className="rule-kicker">
                <span className="kicker-red">{t("settings.agents.kicker")}</span>
              </div>
              <p
                className="font-serif"
                style={{
                  fontStyle: "italic",
                  color: "var(--ink-secondary)",
                  fontSize: 14,
                  margin: "0 0 18px",
                }}
              >
                {t("settings.agents.lede")}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                {AGENTS.map((a) => (
                  <div
                    key={a.n}
                    className="paper-card clickable"
                    onClick={() =>
                      toast(t("settings.agents.alertPrefix") + a.n + t("settings.agents.alertSuffix"))
                    }
                    style={{ padding: 14, textAlign: "center" }}
                  >
                    <div className="font-serif" style={{ fontSize: 15, fontWeight: 600 }}>
                      {a.n}
                    </div>
                    <div
                      className="kicker"
                      style={{
                        fontStyle: "italic",
                        fontFamily: "var(--font-serif)",
                        fontSize: 11,
                        textTransform: "none",
                        letterSpacing: 0,
                        color: "var(--ink-secondary)",
                        margin: "2px 0 8px",
                      }}
                    >
                      {t(a.zhK)}
                    </div>
                    <div
                      className="font-serif"
                      style={{
                        fontSize: 12,
                        color: "var(--ink-secondary)",
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {t(a.dK)}
                    </div>
                    <div className="kicker-red" style={{ fontSize: 9 }}>
                      {t("settings.agents.last")}
                      {t(a.lastK)}
                    </div>
                    <div
                      className="font-mono"
                      style={{ fontSize: 10, color: "var(--ink-tertiary)", marginTop: 2 }}
                    >
                      {a.calls}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>
                  {t("settings.agents.routing")}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {ROUTING.map(([kK, v]) => (
                    <div key={kK} className="paper-card" style={{ padding: "12px 14px" }}>
                      <div className="kicker" style={{ fontSize: 9 }}>
                        {t(kK)}
                      </div>
                      <div
                        className="font-mono"
                        style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}
                      >
                        {v}
                      </div>
                      <button
                        type="button"
                        className="pill"
                        style={{ marginTop: 8, fontSize: 9 }}
                        onClick={() => toast(t("settings.agents.routeChange"))}
                      >
                        {t("settings.profile.change")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Plan */}
            <section id="plan" style={{ marginBottom: 48 }}>
              <div className="rule-kicker">
                <span className="kicker-red">{t("settings.plan.kicker")}</span>
              </div>
              <div
                className="paper-card is-feature"
                style={{
                  padding: "24px 28px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <div>
                  <span className="pill pill-red" style={{ marginBottom: 8 }}>
                    {t("settings.plan.current")}
                  </span>
                  <div
                    className="font-serif"
                    style={{ fontSize: 24, fontWeight: 600, marginTop: 6 }}
                  >
                    {t("settings.plan.price")}
                  </div>
                  <div
                    className="font-serif"
                    style={{
                      fontStyle: "italic",
                      color: "var(--ink-secondary)",
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {t("settings.plan.next")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Link href="/pricing" className="btn btn-ghost">
                    {t("settings.plan.btn.change")}
                  </Link>
                  <button
                    type="button"
                    className="pill"
                    style={{ marginTop: 8, fontSize: 9 }}
                    onClick={() => toast(t("settings.plan.alert.pause"))}
                  >
                    {t("settings.plan.btn.pause")}
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                {PLAN_STATS.map(([k, v]) => (
                  <div
                    key={k}
                    style={{ padding: "12px 14px", background: "var(--bg-paper-warm)" }}
                  >
                    <div className="kicker" style={{ fontSize: 9 }}>
                      {k}
                    </div>
                    <div className="font-mono" style={{ fontSize: 13, marginTop: 4 }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Data */}
            <section id="data">
              <div className="rule-kicker">
                <span className="kicker-red">{t("settings.data.kicker")}</span>
              </div>
              <p
                className="font-serif"
                style={{
                  fontStyle: "italic",
                  color: "var(--ink-secondary)",
                  fontSize: 14,
                  margin: "0 0 14px",
                }}
              >
                {t("settings.data.lede")}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {DATA_ROWS.map((r) => (
                  <article key={r.kK} className="paper-card" style={{ padding: "16px 18px" }}>
                    <div className="font-serif" style={{ fontSize: 15, fontWeight: 600 }}>
                      {t(r.kK)}
                    </div>
                    <div
                      className="font-serif"
                      style={{
                        fontSize: 13,
                        fontStyle: "italic",
                        color: "var(--ink-secondary)",
                        margin: "4px 0 10px",
                      }}
                    >
                      {t(r.dK)}
                    </div>
                    <button
                      type="button"
                      className={r.danger ? "pill pill-red" : "pill"}
                      style={{ fontSize: 10 }}
                      onClick={() => toast(t(r.ctaK) + t("settings.data.alertSuffix"))}
                    >
                      {t(r.ctaK)} →
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
