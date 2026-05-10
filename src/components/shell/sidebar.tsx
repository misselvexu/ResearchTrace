/**
 * Sidebar — left rail (248px wide, dark theme, sticky full-height).
 *
 * 1:1 visual port of legacy js/shell.js → buildSidebar(). Uses Next.js
 * <Link> for client-side nav and reads next-intl translations for labels.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { NAV, type NavItemId } from "./nav-config";

interface SidebarProps {
  activeId?: NavItemId;
}

export function Sidebar({ activeId }: SidebarProps) {
  const t = useTranslations();

  return (
    <aside
      className="sidebar rt-sidebar fade-up"
      style={{
        width: 248,
        minWidth: 248,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Brand */}
      <div
        className="rt-sidebar-brand"
        style={{
          padding: "22px 18px 14px",
          borderBottom: "1px solid var(--rule-on-dark)",
        }}
      >
        <Link
          href="/today"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#fff",
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
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 600,
              color: "#fff",
              letterSpacing: ".01em",
            }}
          >
            研迹
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 9,
              color: "var(--ink-mute-on-dark)",
              letterSpacing: ".18em",
            }}
          >
            RESEARCH
            <br />
            TRACE
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "6px 0 14px" }}>
        {NAV.map((entry, idx) => {
          if (entry.kind === "section") {
            return (
              <div key={`section-${idx}`} className="nav-section">
                {t(entry.key)}
              </div>
            );
          }
          const active = entry.id === activeId ? " is-active" : "";
          return (
            <Link
              key={entry.id}
              href={entry.href}
              className={`nav-item${active}`}
            >
              {entry.tone === "topic" && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent-red-soft)",
                    display: "inline-block",
                  }}
                />
              )}
              <span>{t(entry.key)}</span>
              {entry.badge && (
                <span className="ml-auto chip-dark">{entry.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer stats */}
      <div
        className="rt-sidebar-footer"
        style={{
          padding: "14px 16px",
          borderTop: "1px solid var(--rule-on-dark)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: ".12em",
          color: "#6F6760",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>{t("shell.vault._value")}</span>
          <span style={{ color: "var(--ink-mute-on-dark)" }}>{t("shell.vault.value")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>{t("shell.briefs._value")}</span>
          <span style={{ color: "var(--ink-mute-on-dark)" }}>{t("shell.briefs.value")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{t("shell.plan._value")}</span>
          <span style={{ color: "var(--accent-red-soft)" }}>{t("shell.plan.value")}</span>
        </div>
      </div>
    </aside>
  );
}
