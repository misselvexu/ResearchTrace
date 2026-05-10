"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PrefSwitcher } from "@/components/providers/pref-switcher";
import { toast } from "@/components/providers/toast";
import { signIn } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password.trim()) {
      toast(t("login.alert.missing"));
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      toast(t("login.alert.invalidEmail"));
      return;
    }
    setSubmitting(true);
    // DEMO: simulate latency, persist session, redirect to /today
    setTimeout(() => {
      signIn({ email: email.trim() });
      toast.success(t("login.alert.demo"));
      router.push("/today");
    }, 600);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--bg-paper)",
      }}
    >
      {/* Left · form column */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "32px 56px 40px",
          minHeight: "100vh",
        }}
      >
        {/* Brand header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 56,
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
              研迹 ResearchTrace
            </span>
          </Link>
          <PrefSwitcher />
        </div>

        {/* Title */}
        <div style={{ maxWidth: 440, margin: "0 auto", width: "100%", flex: 1 }}>
          <div className="kicker-red" style={{ marginBottom: 12 }}>
            {t("login.kicker")}
          </div>
          <h1
            className="headline"
            style={{ fontSize: 40, lineHeight: 1.1, margin: "0 0 12px" }}
          >
            {t("login.title")}
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--ink-secondary)",
              margin: "0 0 32px",
              lineHeight: 1.55,
            }}
          >
            {t("login.lede")}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label
                className="kicker"
                style={{ display: "block", fontSize: 9, marginBottom: 6 }}
              >
                {t("login.form.emailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.form.emailPlaceholder")}
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1px solid var(--divider)",
                  background: "var(--bg-card)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  color: "var(--ink-primary)",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <label className="kicker" style={{ fontSize: 9 }}>
                  {t("login.form.passwordLabel")}
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast(t("login.form.forgot"));
                  }}
                  className="link-red"
                  style={{ fontSize: 11, textDecoration: "none" }}
                >
                  {t("login.form.forgot")}
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.form.passwordPlaceholder")}
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1px solid var(--divider)",
                  background: "var(--bg-card)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  color: "var(--ink-primary)",
                }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 22,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: "var(--accent-red)" }}
              />
              <span
                className="font-serif"
                style={{ fontSize: 13, color: "var(--ink-secondary)" }}
              >
                {t("login.form.remember")}
              </span>
            </label>

            <button
              type="submit"
              className="btn btn-red"
              disabled={submitting}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px 16px",
                fontSize: 12,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "wait" : "pointer",
              }}
            >
              {submitting ? t("login.form.submitting") : t("login.form.submit")}
            </button>
          </form>

          {/* Divider + OAuth */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "28px 0 18px",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
            <span className="kicker" style={{ fontSize: 9, color: "var(--ink-tertiary)" }}>
              {t("login.oauth._value")}
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {(["google", "github", "apple"] as const).map((p) => (
              <button
                key={p}
                type="button"
                className="btn btn-ghost"
                onClick={() => toast(`OAuth · ${t(`login.oauth.${p}`)}`)}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "10px 14px",
                  fontSize: 12,
                }}
              >
                {t(`login.oauth.${p}`)}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 36,
              paddingTop: 22,
              borderTop: "1px solid var(--divider)",
              fontFamily: "var(--font-serif)",
              fontSize: 13,
              color: "var(--ink-secondary)",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              {t("login.footer.noAccount")}{" "}
              <Link
                href="/signup"
                className="link-red"
                style={{ textDecoration: "none", fontWeight: 600 }}
              >
                {t("login.footer.signupCta")}
              </Link>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-tertiary)", lineHeight: 1.5 }}>
              {t("login.footer.terms")}{" "}
              <Link href="/legal/terms" className="link-red" style={{ textDecoration: "none" }}>
                {t("login.footer.termsLink")}
              </Link>{" "}
              {t("login.footer.and")}{" "}
              <Link href="/legal/privacy" className="link-red" style={{ textDecoration: "none" }}>
                {t("login.footer.privacyLink")}
              </Link>
              。
            </div>
          </div>
        </div>
      </section>

      {/* Right · editorial side */}
      <aside
        style={{
          background: "var(--bg-sidebar)",
          color: "#fff",
          padding: "56px 56px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 460, position: "relative", zIndex: 1 }}>
          <div
            className="kicker-red"
            style={{ color: "var(--accent-red-soft)", marginBottom: 18 }}
          >
            {t("login.side.kicker")}
          </div>
          <blockquote
            className="font-serif"
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              fontWeight: 600,
              margin: "0 0 18px",
              fontStyle: "italic",
              color: "#fff",
            }}
          >
            {t("login.side.headline")}
          </blockquote>
          <div
            className="font-serif"
            style={{
              fontSize: 14,
              color: "var(--ink-mute-on-dark)",
              marginBottom: 36,
            }}
          >
            {t("login.side.byline")}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 24,
              paddingTop: 22,
              borderTop: "1px solid var(--rule-on-dark)",
            }}
          >
            {([1, 2, 3] as const).map((i) => (
              <div key={i}>
                <div
                  className="kicker"
                  style={{
                    fontSize: 9,
                    color: "var(--ink-mute-on-dark)",
                    marginBottom: 6,
                  }}
                >
                  {t(`login.side.stats.k${i}`)}
                </div>
                <div
                  className="font-serif"
                  style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}
                >
                  {t(`login.side.stats.v${i}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="watermark-number"
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 24,
            right: 32,
            fontSize: 180,
            color: "var(--accent-red-soft)",
            opacity: 0.16,
            fontWeight: 700,
            lineHeight: 0.9,
          }}
        >
          127
        </div>
      </aside>
    </main>
  );
}
