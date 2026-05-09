"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PrefSwitcher } from "@/components/providers/pref-switcher";

type RoleId = "pm" | "founder" | "researcher" | "engineer" | "writer" | "other";

const ROLES: { id: RoleId; icon: string; tK: string; dK: string; topics: string }[] = [
  { id: "pm", icon: "♟", tK: "onboarding.s1.r1.t", dK: "onboarding.s1.r1.d", topics: "AI Product Strategy / Agentic / Eval" },
  { id: "founder", icon: "✦", tK: "onboarding.s1.r2.t", dK: "onboarding.s1.r2.d", topics: "Product Strategy / Open Source / Infra" },
  { id: "researcher", icon: "⌬", tK: "onboarding.s1.r3.t", dK: "onboarding.s1.r3.d", topics: "Long Context / RAG / Reasoning" },
  { id: "engineer", icon: "⚙", tK: "onboarding.s1.r4.t", dK: "onboarding.s1.r4.d", topics: "Infra / Fine-tuning / Open Source" },
  { id: "writer", icon: "✎", tK: "onboarding.s1.r5.t", dK: "onboarding.s1.r5.d", topics: "Product Strategy / Multimodal" },
  { id: "other", icon: "…", tK: "onboarding.s1.r6.t", dK: "onboarding.s1.r6.d", topics: "Custom" },
];

const TOPICS_S2: { name: string; zhK: string; defaultSel: boolean }[] = [
  { name: "LLM Long Context", zhK: "onboarding.s2.t1.zh", defaultSel: true },
  { name: "Agentic Workflows", zhK: "onboarding.s2.t2.zh", defaultSel: true },
  { name: "AI Evaluation", zhK: "onboarding.s2.t3.zh", defaultSel: true },
  { name: "RAG & Memory", zhK: "onboarding.s2.t4.zh", defaultSel: true },
  { name: "AI Product Strategy", zhK: "onboarding.s2.t5.zh", defaultSel: true },
  { name: "Alignment & Safety", zhK: "onboarding.s2.t6.zh", defaultSel: false },
  { name: "Multimodal & Vision", zhK: "onboarding.s2.t7.zh", defaultSel: false },
  { name: "Reasoning & Math", zhK: "onboarding.s2.t8.zh", defaultSel: false },
  { name: "Open Source Models", zhK: "onboarding.s2.t9.zh", defaultSel: false },
  { name: "AI Infrastructure", zhK: "onboarding.s2.t10.zh", defaultSel: false },
  { name: "Fine-tuning", zhK: "onboarding.s2.t11.zh", defaultSel: false },
  { name: "Voice & Real-time", zhK: "onboarding.s2.t12.zh", defaultSel: false },
];

const SOURCES_S3: { n: string; tK: string; dK: string; ctaK: string; done: boolean }[] = [
  { n: "01", tK: "onboarding.s3.s1.t", dK: "onboarding.s3.s1.d", ctaK: "onboarding.s3.s1.cta", done: false },
  { n: "02", tK: "onboarding.s3.s2.t", dK: "onboarding.s3.s2.d", ctaK: "onboarding.s3.s2.cta", done: false },
  { n: "03", tK: "onboarding.s3.s3.t", dK: "onboarding.s3.s3.d", ctaK: "onboarding.s3.s3.cta", done: true },
  { n: "04", tK: "onboarding.s3.s4.t", dK: "onboarding.s3.s4.d", ctaK: "onboarding.s3.s4.cta", done: false },
  { n: "05", tK: "onboarding.s3.s5.t", dK: "onboarding.s3.s5.d", ctaK: "onboarding.s3.s5.cta", done: false },
  { n: "06", tK: "onboarding.s3.s6.t", dK: "onboarding.s3.s6.d", ctaK: "onboarding.s3.s6.cta", done: false },
];

const DELIVERY_S4: [string, string, string][] = [
  ["onboarding.s4.d1.k", "onboarding.s4.d1.v", "var(--warning-amber)"],
  ["onboarding.s4.d2.k", "onboarding.s4.d2.v", "var(--accent-red)"],
  ["onboarding.s4.d3.k", "onboarding.s4.d3.v", "var(--ink-primary)"],
  ["onboarding.s4.d4.k", "onboarding.s4.d4.v", "var(--ink-primary)"],
];

export default function OnboardingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    new Set(TOPICS_S2.filter((tt) => tt.defaultSel).map((tt) => tt.name)),
  );
  const [customTopic, setCustomTopic] = useState("");
  const [channel, setChannel] = useState("app");
  const [depth, setDepth] = useState("std");

  function nextStep() {
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  }
  function prevStep() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  }
  function finish() {
    alert(t("onboarding.finish.alert"));
    router.push("/today");
  }
  function toggleTopic(name: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const titleK = `onboarding.s${step}.title`;
  const subtitleK = `onboarding.s${step}.subtitle`;

  return (
    <>
      {/* Standalone header — no sidebar */}
      <header
        id="ob-header"
        style={{ borderBottom: "1px solid var(--divider)", background: "var(--bg-paper)" }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/landing"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--ink-primary)",
            }}
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
              {t("onboarding.brand")}
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <PrefSwitcher />
            <span className="kicker">
              {t("onboarding.step")} <span id="curStep">{step}</span> / 4
            </span>
            <a
              href="/today"
              className="pill"
              onClick={(e) => {
                if (!confirm(t("common.confirmSkip"))) e.preventDefault();
              }}
            >
              {t("onboarding.skip")}
            </a>
          </div>
        </div>
        <div style={{ height: 3, background: "var(--divider)" }}>
          <div
            id="progressBar"
            style={{
              height: "100%",
              background: "var(--accent-red)",
              width: `${step * 25}%`,
              transition: "width .3s",
            }}
          />
        </div>
      </header>

      <main id="main">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>
                {t("onboarding.kicker")}
              </div>
              <h1 className="headline" style={{ fontSize: 38, margin: "0 0 8px" }}>
                {t(titleK)}
              </h1>
              <p
                className="font-serif"
                style={{
                  fontStyle: "italic",
                  fontSize: 16,
                  color: "var(--ink-secondary)",
                  margin: 0,
                }}
              >
                {t(subtitleK)}
              </p>
            </div>
            <div className="watermark-number" style={{ fontSize: 90, opacity: 0.85 }}>
              0{step}
            </div>
          </div>

          <div>
            {step === 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 18,
                }}
              >
                {ROLES.map((r) => {
                  const active = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className="paper-card clickable"
                      onClick={() => setSelectedRole(r.id)}
                      style={{
                        padding: "22px 20px",
                        textAlign: "left",
                        border: `1px solid ${active ? "var(--accent-red)" : "var(--divider)"}`,
                        background: active ? "var(--bg-callout)" : "var(--bg-card)",
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 36,
                          color: "var(--accent-red)",
                          fontFamily: "var(--font-serif)",
                          lineHeight: 1,
                          marginBottom: 10,
                        }}
                      >
                        {r.icon}
                      </div>
                      <div
                        className="font-serif"
                        style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}
                      >
                        {t(r.tK)}
                      </div>
                      <div
                        className="font-serif"
                        style={{
                          fontSize: 13,
                          fontStyle: "italic",
                          color: "var(--ink-secondary)",
                          marginBottom: 12,
                        }}
                      >
                        {t(r.dK)}
                      </div>
                      <div className="kicker" style={{ fontSize: 9 }}>
                        {t("onboarding.s1.defaults")}
                      </div>
                      <div
                        className="font-mono"
                        style={{ fontSize: 11, color: "var(--ink-primary)", marginTop: 2 }}
                      >
                        {r.topics}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <>
                <div
                  id="topicGrid"
                  style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}
                >
                  {TOPICS_S2.map(({ name, zhK }) => {
                    const sel = selectedTopics.has(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        className="paper-card clickable"
                        onClick={() => toggleTopic(name)}
                        style={{
                          padding: "16px 18px",
                          textAlign: "left",
                          border: `1.5px solid ${sel ? "var(--accent-red)" : "var(--divider)"}`,
                          background: sel ? "var(--bg-callout)" : "var(--bg-card)",
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <div className="font-serif" style={{ fontSize: 15.5, fontWeight: 600 }}>
                              {name}
                            </div>
                            <div
                              className="font-serif"
                              style={{
                                fontSize: 12.5,
                                fontStyle: "italic",
                                color: "var(--ink-secondary)",
                              }}
                            >
                              {t(zhK)}
                            </div>
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              width: 18,
                              height: 18,
                              alignItems: "center",
                              justifyContent: "center",
                              border: `1.5px solid ${sel ? "var(--accent-red)" : "var(--divider-strong)"}`,
                              background: sel ? "var(--accent-red)" : "transparent",
                              color: "#fff",
                              fontSize: 11,
                            }}
                          >
                            {sel ? "✓" : ""}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: 24,
                    padding: "14px 18px",
                    background: "var(--bg-paper-warm)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span className="kicker-red">{t("onboarding.s2.custom._value")}</span>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder={t("onboarding.s2.custom.placeholder")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid var(--divider)",
                      background: "var(--bg-card)",
                      fontFamily: "var(--font-serif)",
                      fontSize: 14,
                    }}
                  />
                  <button
                    type="button"
                    className="pill pill-red"
                    onClick={() => {
                      alert(t("onboarding.s2.add.alert"));
                      setCustomTopic("");
                    }}
                  >
                    {t("onboarding.s2.add._value")}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2,1fr)",
                    gap: 14,
                    marginBottom: 22,
                  }}
                >
                  {SOURCES_S3.map((s) => (
                    <article
                      key={s.n}
                      className="paper-card"
                      style={{
                        padding: "18px 20px",
                        display: "grid",
                        gridTemplateColumns: "54px 1fr 130px",
                        gap: 14,
                        alignItems: "center",
                        ...(s.done ? { background: "var(--bg-paper-warm)" } : {}),
                      }}
                    >
                      <div
                        className="font-serif"
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color: "var(--accent-red)",
                          lineHeight: 1,
                        }}
                      >
                        {s.n}
                      </div>
                      <div>
                        <div
                          className="font-serif"
                          style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}
                        >
                          {t(s.tK)}
                        </div>
                        <div
                          className="font-serif"
                          style={{
                            fontSize: 13,
                            fontStyle: "italic",
                            color: "var(--ink-secondary)",
                          }}
                        >
                          {t(s.dK)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={s.done ? "pill is-active" : "btn btn-ghost"}
                        style={s.done ? undefined : { fontSize: 10 }}
                        onClick={() => alert(t(s.ctaK))}
                      >
                        {s.done ? t("onboarding.s3.connected") : t(s.ctaK)}
                      </button>
                    </article>
                  ))}
                </div>
                <div
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    fontSize: 14,
                    color: "var(--ink-secondary)",
                  }}
                  dangerouslySetInnerHTML={{ __html: t.raw("onboarding.s3.tip.html") as string }}
                />
              </>
            )}

            {step === 4 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                  <div className="kicker-red" style={{ marginBottom: 14 }}>
                    {t("onboarding.s4.delivery")}
                  </div>
                  <div
                    style={{
                      border: "1px solid var(--divider)",
                      background: "var(--bg-card)",
                      padding: "18px 20px",
                    }}
                  >
                    {DELIVERY_S4.map(([kK, vK, color]) => (
                      <div key={kK} className="leader" style={{ marginBottom: 12 }}>
                        <span className="kicker" style={{ fontSize: 10 }}>
                          {t(kK)}
                        </span>
                        <span className="dots" />
                        <span className="font-mono" style={{ fontSize: 12, color }}>
                          {t(vK)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="kicker-red" style={{ margin: "22px 0 12px" }}>
                    {t("onboarding.s4.channel")}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["app", "email", "rss", "wechat"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`pill ${channel === c ? "is-active" : ""}`}
                        onClick={() => setChannel(c)}
                      >
                        {t(`onboarding.s4.ch.${c}`)}
                      </button>
                    ))}
                  </div>

                  <div className="kicker-red" style={{ margin: "22px 0 12px" }}>
                    {t("onboarding.s4.depth._value")}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["short", "std", "deep"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`pill ${depth === d ? "is-active" : ""}`}
                        onClick={() => setDepth(d)}
                      >
                        {t(`onboarding.s4.depth.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="kicker-red" style={{ marginBottom: 14 }}>
                    {t("onboarding.s4.preview._value")}
                  </div>
                  <Link
                    href="/briefs/preview"
                    className="paper-card"
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                      overflow: "hidden",
                      border: "1px solid var(--divider)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "16/9",
                        borderBottom: "1px solid var(--divider)",
                      }}
                    >
                      <Image
                        src="/img/thumb-longctx.png"
                        alt=""
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 1100px) 50vw, 550px"
                      />
                      <span
                        className="watermark-number"
                        style={{ position: "absolute", top: -8, right: 8, fontSize: 60 }}
                      >
                        001
                      </span>
                      <span
                        className="pill pill-red"
                        style={{ position: "absolute", top: 14, left: 14, fontSize: 9 }}
                      >
                        PREVIEW
                      </span>
                    </div>
                    <div style={{ padding: "18px 20px" }}>
                      <div className="kicker-red" style={{ marginBottom: 6 }}>
                        {t("onboarding.s4.preview.kicker")}
                      </div>
                      <div
                        className="font-serif"
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          marginBottom: 8,
                        }}
                      >
                        {t("onboarding.s4.preview.title")}
                      </div>
                      <div
                        className="font-serif"
                        style={{
                          fontStyle: "italic",
                          fontSize: 13,
                          color: "var(--ink-secondary)",
                        }}
                      >
                        {t("onboarding.s4.preview.sub")}
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: ".12em",
                          color: "var(--accent-red)",
                        }}
                      >
                        {t("onboarding.s4.preview.cta")}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 36,
              paddingTop: 18,
              borderTop: "1px solid var(--divider)",
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              style={step === 1 ? { visibility: "hidden" } : undefined}
              onClick={prevStep}
            >
              {t("onboarding.btn.back")}
            </button>
            <div className="kicker">
              {t("onboarding.stepLabel")} {step} {t("onboarding.stepOf")}
            </div>
            {step === 4 ? (
              <button type="button" className="btn btn-red" onClick={finish}>
                {t("onboarding.btn.deliver")}
              </button>
            ) : (
              <button type="button" className="btn btn-red" onClick={nextStep}>
                {t("onboarding.btn.continue")}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
