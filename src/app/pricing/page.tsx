"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PublicShell } from "@/components/shell/public-shell";
import { toast } from "@/components/providers/toast";
import { isAuthed } from "@/lib/auth";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  tier: string;
  nameK: string;
  zhK: string;
  price: string;
  periodK: string;
  color: string;
  pitchK: string;
  current: boolean;
  highlight?: boolean;
  features: [string, string][];
};

const PLANS: Plan[] = [
  {
    tier: "01",
    nameK: "pricing.p1.name",
    zhK: "pricing.p1.zh",
    price: "$0",
    periodK: "pricing.p1.period",
    color: "var(--ink-primary)",
    pitchK: "pricing.p1.pitch",
    current: false,
    features: [
      ["pricing.feat.topics", "pricing.v.p1.topics"],
      ["pricing.feat.vault", "pricing.v.p1.vault"],
      ["pricing.feat.calls", "pricing.v.p1.calls"],
      ["pricing.feat.briefs", "pricing.v.p1.briefs"],
      ["pricing.feat.channel", "pricing.v.p1.channel"],
      ["pricing.feat.routing", "pricing.v.p1.routing"],
      ["pricing.feat.evidence", "pricing.v.p1.evidence"],
      ["pricing.feat.export", "pricing.v.p1.export"],
    ],
  },
  {
    tier: "02",
    nameK: "pricing.p2.name",
    zhK: "pricing.p2.zh",
    price: "$15",
    periodK: "pricing.p2.period",
    color: "var(--ink-primary)",
    pitchK: "pricing.p2.pitch",
    current: false,
    features: [
      ["pricing.feat.topics", "pricing.v.p2.topics"],
      ["pricing.feat.vault", "pricing.v.p2.vault"],
      ["pricing.feat.calls", "pricing.v.p2.calls"],
      ["pricing.feat.briefs", "pricing.v.p2.briefs"],
      ["pricing.feat.channel", "pricing.v.p2.channel"],
      ["pricing.feat.routing", "pricing.v.p2.routing"],
      ["pricing.feat.sync", "pricing.v.p2.sync"],
      ["pricing.feat.fwd", "pricing.v.p2.fwd"],
    ],
  },
  {
    tier: "03",
    nameK: "pricing.p3.name",
    zhK: "pricing.p3.zh",
    price: "$29",
    periodK: "pricing.p3.period",
    color: "var(--accent-red)",
    pitchK: "pricing.p3.pitch",
    current: false,
    highlight: true,
    features: [
      ["pricing.feat.topics", "pricing.v.p3.topics"],
      ["pricing.feat.vault", "pricing.v.p3.vault"],
      ["pricing.feat.calls", "pricing.v.p3.calls"],
      ["pricing.feat.briefs", "pricing.v.p3.briefs"],
      ["pricing.feat.channel", "pricing.v.p3.channel"],
      ["pricing.feat.routing", "pricing.v.p3.routing"],
      ["pricing.feat.e2ee", "pricing.v.p3.e2ee"],
      ["pricing.feat.priority", "pricing.v.p3.priority"],
    ],
  },
  {
    tier: "04",
    nameK: "pricing.p4.name",
    zhK: "pricing.p4.zh",
    price: "$99",
    periodK: "pricing.p4.period",
    color: "var(--ink-primary)",
    pitchK: "pricing.p4.pitch",
    current: false,
    features: [
      ["pricing.feat.seats", "pricing.v.p4.seats"],
      ["pricing.feat.shared", "pricing.v.p4.shared"],
      ["pricing.feat.sharedT", "pricing.v.p4.sharedT"],
      ["pricing.feat.sharedB", "pricing.v.p4.sharedB"],
      ["pricing.feat.admin", "pricing.v.p4.admin"],
      ["pricing.feat.routing", "pricing.v.p4.routing"],
      ["pricing.feat.private", "pricing.v.p4.private"],
      ["pricing.feat.cs", "pricing.v.p4.cs"],
    ],
  },
];

const FAQS: [string, string][] = [
  ["pricing.faq.q1", "pricing.faq.a1"],
  ["pricing.faq.q2", "pricing.faq.a2"],
  ["pricing.faq.q3", "pricing.faq.a3"],
  ["pricing.faq.q4", "pricing.faq.a4"],
  ["pricing.faq.q5", "pricing.faq.a5"],
  ["pricing.faq.q6", "pricing.faq.a6"],
];

function ctaLabelKey(p: Plan) {
  if (p.tier === "01") return "pricing.btn.free";
  if (p.tier === "04") return "pricing.btn.contact";
  return "pricing.btn.trial";
}

export default function PricingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  function handleCta(p: Plan) {
    if (p.tier === "04") {
      toast(t("pricing.alert.trial"));
      return;
    }
    // Already signed-in users go straight to billing; visitors register first.
    if (isAuthed()) {
      router.push("/billing");
    } else {
      router.push("/signup");
    }
  }

  return (
    <PublicShell activeNav="pricing" crumb={t("pricing.crumb")}>
      {/* Hero */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 48px 28px", textAlign: "center", position: "relative" }}>
          <div className="kicker-red" style={{ marginBottom: 14 }}>{t("pricing.kicker")}</div>
          <h1 className="headline" style={{ fontSize: 54, margin: "0 0 12px" }}>{t("pricing.title")}</h1>
          <p
            className="font-serif"
            style={{ fontStyle: "italic", fontSize: 18, color: "var(--ink-secondary)", maxWidth: 680, margin: "0 auto" }}
          >
            {t("pricing.lede")}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            <button
              className={`pill ${cycle === "monthly" ? "is-active" : ""}`}
              onClick={() => setCycle("monthly")}
            >
              {t("pricing.monthly")}
            </button>
            <button
              className={`pill ${cycle === "yearly" ? "is-active" : ""}`}
              onClick={() => {
                setCycle("yearly");
                toast(t("pricing.yearly.alert"));
              }}
            >
              {t("pricing.yearly._value")}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 48px 56px" }}>
          {/* Plan grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, alignItems: "stretch" }}>
            {PLANS.map((p) => (
              <article
                key={p.tier}
                className={`paper-card ${p.highlight ? "is-feature" : ""}`}
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  ...(p.highlight
                    ? {
                        border: "1.5px solid var(--accent-red)",
                        boxShadow: "var(--shadow-lift)",
                        transform: "translateY(-6px)",
                      }
                    : {}),
                }}
              >
                {p.highlight && (
                  <span
                    className="pill pill-red"
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 10,
                      background: "var(--accent-red)",
                      color: "#fff",
                      borderColor: "var(--accent-red)",
                    }}
                  >
                    {t("pricing.popular")}
                  </span>
                )}
                {/* "Your plan" badge intentionally omitted on public pricing page */}
                <div
                  className="watermark-number"
                  style={{ fontSize: 48, color: p.color, opacity: 0.85, marginBottom: 8 }}
                >
                  {p.tier}
                </div>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600 }}>{t(p.nameK)}</div>
                <div
                  className="kicker"
                  style={{
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    fontSize: 13,
                    textTransform: "none",
                    letterSpacing: 0,
                    color: "var(--ink-secondary)",
                    marginBottom: 14,
                  }}
                >
                  {t(p.zhK)}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    borderTop: "1px solid var(--divider)",
                    borderBottom: "1px solid var(--divider)",
                    padding: "14px 0",
                    marginBottom: 16,
                  }}
                >
                  <span
                    className="font-serif"
                    style={{ fontSize: 38, fontWeight: 700, color: p.color, letterSpacing: "-.02em" }}
                  >
                    {p.price}
                  </span>
                  <span className="kicker" style={{ fontSize: 11 }}>{t(p.periodK)}</span>
                </div>

                <p
                  className="font-serif"
                  style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink-secondary)", margin: "0 0 18px", lineHeight: 1.5 }}
                >
                  {t(p.pitchK)}
                </p>

                <div style={{ flex: 1, marginBottom: 18 }}>
                  {p.features.map(([kK, vK]) => (
                    <div key={kK} className="leader" style={{ padding: "6px 0" }}>
                      <span className="font-serif" style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{t(kK)}</span>
                      <span className="dots" />
                      <span
                        className="font-mono"
                        style={{ fontSize: 11, color: "var(--ink-primary)", fontWeight: 500 }}
                      >
                        {t(vK)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-red"
                  onClick={() => handleCta(p)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {t(ctaLabelKey(p))}
                </button>
              </article>
            ))}
          </div>

          {/* Edu card */}
          <div
            style={{
              marginTop: 48,
              padding: "24px 28px",
              background: "var(--bg-paper-warm)",
              border: "1px solid var(--divider)",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div>
              <div className="kicker-red" style={{ marginBottom: 8 }}>{t("pricing.eduTitle")}</div>
              <div className="font-serif" style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{t("pricing.eduBody")}</div>
              <div
                className="font-serif"
                style={{ fontStyle: "italic", fontSize: 13.5, color: "var(--ink-secondary)" }}
              >
                {t("pricing.eduSub")}
              </div>
            </div>
            <button className="btn btn-ghost" onClick={() => toast(t("pricing.eduCta.alert"))}>
              {t("pricing.eduCta._value")}
            </button>
          </div>

          {/* FAQ */}
          <div style={{ marginTop: 60 }}>
            <div className="rule-kicker">
              <span className="kicker-red">{t("pricing.faq._value")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 36px" }}>
              {FAQS.map(([qK, aK]) => (
                <article key={qK}>
                  <div className="font-serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t(qK)}</div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-secondary)" }}
                  >
                    {t(aK)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
