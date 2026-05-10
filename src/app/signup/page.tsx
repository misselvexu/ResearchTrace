"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PrefSwitcher } from "@/components/providers/pref-switcher";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const PERKS = ["p1", "p2", "p3", "p4"] as const;

export default function SignupPage() {
  const t = useTranslations();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert(t("signup.alert.missing"));
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      alert(t("signup.alert.invalidEmail"));
      return;
    }
    if (!PASSWORD_RE.test(password)) {
      alert(t("signup.alert.weakPassword"));
      return;
    }
    if (!agree) {
      alert(t("signup.alert.needAgree"));
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      alert(t("signup.alert.demo"));
      router.push("/onboarding");
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
            marginBottom: 48,
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

        <div style={{ maxWidth: 460, margin: "0 auto", width: "100%", flex: 1 }}>
          <div className="kicker-red" style={{ marginBottom: 12 }}>
            {t("signup.kicker")}
          </div>
          <h1
            className="headline"
            style={{ fontSize: 36, lineHeight: 1.12, margin: "0 0 12px" }}
          >
            {t("signup.title")}
          </h1>
          <p
            className="font-serif"
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--ink-secondary)",
              margin: "0 0 28px",
              lineHeight: 1.55,
            }}
          >
            {t("signup.lede")}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 14 }}>
              <label className="kicker" style={{ display: "block", fontSize: 9, marginBottom: 6 }}>
                {t("signup.form.nameLabel")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("signup.form.namePlaceholder")}
                autoComplete="name"
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
              <label className="kicker" style={{ display: "block", fontSize: 9, marginBottom: 6 }}>
                {t("signup.form.emailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("signup.form.emailPlaceholder")}
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

            <div style={{ marginBottom: 8 }}>
              <label className="kicker" style={{ display: "block", fontSize: 9, marginBottom: 6 }}>
                {t("signup.form.passwordLabel")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("signup.form.passwordPlaceholder")}
                autoComplete="new-password"
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
              <div
                className="font-serif"
                style={{
                  fontSize: 11,
                  fontStyle: "italic",
                  color: "var(--ink-tertiary)",
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                {t("signup.form.passwordHint")}
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                margin: "18px 0 22px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{ accentColor: "var(--accent-red)", marginTop: 3 }}
              />
              <span
                className="font-serif"
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {t("signup.form.agree")}{" "}
                <Link
                  href="/legal/terms"
                  className="link-red"
                  style={{ textDecoration: "none" }}
                >
                  {t("signup.form.termsLink")}
                </Link>{" "}
                {t("signup.form.and")}{" "}
                <Link
                  href="/legal/privacy"
                  className="link-red"
                  style={{ textDecoration: "none" }}
                >
                  {t("signup.form.privacyLink")}
                </Link>
                。
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
              {submitting ? t("signup.form.submitting") : t("signup.form.submit")}
            </button>
          </form>

          {/* OAuth */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "26px 0 16px",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
            <span className="kicker" style={{ fontSize: 9, color: "var(--ink-tertiary)" }}>
              {t("signup.oauth._value")}
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {(["google", "github", "apple"] as const).map((p) => (
              <button
                key={p}
                type="button"
                className="btn btn-ghost"
                onClick={() => alert(`OAuth · ${t(`signup.oauth.${p}`)}`)}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "10px 14px",
                  fontSize: 12,
                }}
              >
                {t(`signup.oauth.${p}`)}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: 32,
              paddingTop: 18,
              borderTop: "1px solid var(--divider)",
              fontFamily: "var(--font-serif)",
              fontSize: 13,
              color: "var(--ink-secondary)",
            }}
          >
            {t("signup.footer.haveAccount")}{" "}
            <Link
              href="/login"
              className="link-red"
              style={{ textDecoration: "none", fontWeight: 600 }}
            >
              {t("signup.footer.loginCta")}
            </Link>
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
            {t("signup.side.kicker")}
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
            {t("signup.side.headline")}
          </blockquote>
          <div
            className="font-serif"
            style={{
              fontSize: 14,
              color: "var(--ink-mute-on-dark)",
              marginBottom: 36,
            }}
          >
            {t("signup.side.byline")}
          </div>

          <div className="rule-kicker" style={{ borderTopColor: "var(--rule-on-dark)" }}>
            <span
              className="kicker-red"
              style={{ color: "var(--accent-red-soft)" }}
            >
              {t("signup.perks._value")}
            </span>
          </div>
          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {PERKS.map((p, i) => (
              <div
                key={p}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: 14,
                  alignItems: "baseline",
                  paddingBottom: 12,
                  borderBottom:
                    i < PERKS.length - 1 ? "1px dotted var(--rule-on-dark)" : "none",
                }}
              >
                <div
                  className="font-serif"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--accent-red-soft)",
                    lineHeight: 1,
                  }}
                >
                  0{i + 1}
                </div>
                <div>
                  <div
                    className="font-serif"
                    style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}
                  >
                    {t(`signup.perks.${p}.k`)}
                  </div>
                  <div
                    className="font-serif"
                    style={{
                      fontSize: 12.5,
                      fontStyle: "italic",
                      color: "var(--ink-mute-on-dark)",
                      marginTop: 2,
                    }}
                  >
                    {t(`signup.perks.${p}.v`)}
                  </div>
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
          {t("signup.side.watermark")}
        </div>
      </aside>
    </main>
  );
}
