"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PrefSwitcher } from "@/components/providers/pref-switcher";

type ActiveNav = "about" | "changelog" | "pricing" | "briefs" | null;

export function PublicShell({
  children,
  activeNav = null,
  crumb,
}: {
  children: ReactNode;
  activeNav?: ActiveNav;
  crumb?: string;
}) {
  const t = useTranslations();

  const navItems: { id: NonNullable<ActiveNav>; href: string; label: string }[] = [
    { id: "about", href: "/about", label: t("publicShell.nav.about") },
    { id: "changelog", href: "/changelog", label: t("publicShell.nav.changelog") },
    { id: "pricing", href: "/pricing", label: t("publicShell.nav.pricing") },
    { id: "briefs", href: "/briefs", label: t("publicShell.nav.briefs") },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-paper)", color: "var(--ink-primary)" }}>
      {/* Branded header */}
      <header
        style={{
          borderBottom: "1px solid var(--divider)",
          padding: "20px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-paper)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink-primary)" }}
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

        <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {navItems.map((item) => {
            const active = item.id === activeNav;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="kicker"
                style={{
                  textDecoration: "none",
                  color: active ? "var(--accent-red)" : "var(--ink-secondary)",
                  borderBottom: active ? "1.5px solid var(--accent-red)" : "1.5px solid transparent",
                  paddingBottom: 2,
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <span style={{ width: 1, height: 14, background: "var(--divider-strong)" }} />
          <Link
            href="/login"
            className="kicker"
            style={{
              textDecoration: "none",
              color: "var(--ink-secondary)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {t("publicShell.nav.signin")}
          </Link>
          <Link
            href="/signup"
            className="btn btn-red"
            style={{ textDecoration: "none", fontSize: 12, padding: "6px 14px" }}
          >
            {t("publicShell.nav.trial")}
          </Link>
          <PrefSwitcher />
        </nav>
      </header>

      {crumb ? (
        <div
          className="kicker"
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "18px 48px 0",
            color: "var(--ink-tertiary)",
            fontSize: 11,
            letterSpacing: "0.12em",
          }}
        >
          {crumb}
        </div>
      ) : null}

      {children}

      {/* Footer */}
      <footer
        style={{
          padding: "32px 48px",
          background: "var(--bg-paper)",
          borderTop: "1px solid var(--divider)",
          marginTop: 48,
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            className="font-serif"
            style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-secondary)" }}
          >
            {t("publicShell.footer.tagline")}
            <div className="kicker" style={{ marginTop: 4, color: "var(--ink-tertiary)" }}>
              {t("publicShell.footer.by")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/about" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("publicShell.footer.links.about")}
            </Link>
            <Link href="/changelog" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("publicShell.footer.links.changelog")}
            </Link>
            <Link href="/pricing" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("publicShell.footer.links.pricing")}
            </Link>
            <Link href="/legal/terms" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("publicShell.footer.links.terms")}
            </Link>
            <Link href="/legal/privacy" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("publicShell.footer.links.privacy")}
            </Link>
            <Link href="/" className="link-red" style={{ textDecoration: "none", fontSize: 13 }}>
              {t("publicShell.footer.links.homepage")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
