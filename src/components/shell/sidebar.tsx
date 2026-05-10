/**
 * Sidebar — left rail.
 *
 * Two visual modes, controlled by the `collapsed` prop owned by AppLayout:
 *
 *   - Expanded (default, 248px): brand wordmark + sectioned nav with labels
 *     and badges + footer stats.
 *   - Collapsed (64px): brand monogram + icon-only nav (labels move to
 *     `title` tooltips, badges become a single red dot in the corner) +
 *     footer toggle button at the very bottom.
 *
 * The collapse toggle button lives at the BOTTOM of the rail (under the
 * footer area) per design guidance, with a tooltip on hover.
 */

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { NAV, type NavItemId, type NavEntry } from "./nav-config";

interface SidebarProps {
  activeId?: NavItemId;
  collapsed: boolean;
  onToggle: () => void;
}

// ---------------------------------------------------------------------------
// Icon glyphs — mono SVG, single stroke. Color inherits from currentColor.
// One per nav item id (or `topic-*` shared glyph). Kept terse so the file
// stays focused; visual polish comes from the framework's stroke + spacing.
// ---------------------------------------------------------------------------

function Icon({ id }: { id: NavItemId }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "today":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="16" rx="1.5" />
          <path d="M3 9h18M8 3v3M16 3v3" />
        </svg>
      );
    case "topics":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="12" cy="12" r="8.5" />
        </svg>
      );
    case "ask":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 5.5h16v11h-9l-4 3.5v-3.5H4z" />
          <path d="M9.5 10.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 1.6-2.5 1.7-2.5 3.5M12 14.5v.01" />
        </svg>
      );
    case "briefs":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 3.5h11l3 3v14H5z" />
          <path d="M8 8.5h8M8 12h8M8 15.5h5" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 13l3.5-8h11L21 13v6.5H3z" />
          <path d="M3 13h5l1.5 2.5h5L16 13h5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="m20 20-5-5" />
        </svg>
      );
    case "vault":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 6.5h16v13H4z" />
          <path d="M4 10h16M9 6.5V4h6v2.5" />
        </svg>
      );
    case "sources":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1" />
        </svg>
      );
    case "topic-llm":
    case "topic-agent":
    case "topic-eval":
    case "topic-rag":
    case "topic-pm":
      // Pinned topic — use a soft-red dot for visual continuity with the
      // expanded-state row marker.
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "notifications":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5.5 17.5h13l-1.8-2.5V11a4.7 4.7 0 0 0-9.4 0v4z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case "billing":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="6" width="18" height="13" rx="1.5" />
          <path d="M3 10h18M7 15h3" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.5 12c0-.7-.1-1.3-.2-1.9l1.7-1.4-1.5-2.6-2.1.8a7.5 7.5 0 0 0-3.3-1.9L13.5 3h-3l-.6 2c-1.2.3-2.3 1-3.3 1.9l-2.1-.8L3 8.7l1.7 1.4a7.6 7.6 0 0 0 0 3.8L3 15.3l1.5 2.6 2.1-.8c1 .9 2.1 1.6 3.3 1.9l.6 2h3l.6-2c1.2-.3 2.3-1 3.3-1.9l2.1.8 1.5-2.6-1.7-1.4c.1-.6.2-1.2.2-1.9z" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
  }
}

// Items where a non-empty badge should turn into a red corner dot in the
// collapsed state (visual signal "you have unread / pending things here").
function showsDot(entry: Extract<NavEntry, { kind: "item" }>): boolean {
  if (!entry.badge) return false;
  // Topic counters are decorative ("12"), not unread state — no dot for them.
  if (entry.id === "topics") return false;
  return true;
}

export function Sidebar({ activeId, collapsed, onToggle }: SidebarProps) {
  const t = useTranslations();

  const width = collapsed ? 64 : 248;

  return (
    <aside
      className={`sidebar rt-sidebar fade-up${collapsed ? " is-collapsed" : ""}`}
      style={{
        width,
        minWidth: width,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "width 180ms ease, min-width 180ms ease",
      }}
    >
      {/* Brand */}
      <div
        className="rt-sidebar-brand"
        style={{
          padding: collapsed ? "18px 0 14px" : "22px 18px 14px",
          borderBottom: "1px solid var(--rule-on-dark)",
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Link
          href="/today"
          aria-label="ResearchTrace · Today"
          title={collapsed ? "ResearchTrace" : undefined}
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
              flex: "0 0 auto",
            }}
          >
            研
          </span>
          {!collapsed && (
            <>
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
            </>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "6px 0 14px" }}>
        {NAV.map((entry, idx) => {
          if (entry.kind === "section") {
            if (collapsed) {
              // Replace section heading with a thin divider in collapsed mode.
              if (idx === 0) return null; // skip the very first one (right under brand border)
              return (
                <div
                  key={`section-${idx}`}
                  aria-hidden="true"
                  style={{
                    margin: "10px 14px",
                    height: 1,
                    background: "var(--rule-on-dark)",
                  }}
                />
              );
            }
            return (
              <div key={`section-${idx}`} className="nav-section">
                {t(entry.key)}
              </div>
            );
          }

          const active = entry.id === activeId;
          const label = t(entry.key);

          if (collapsed) {
            const dot = showsDot(entry);
            return (
              <Link
                key={entry.id}
                href={entry.href}
                title={label}
                aria-label={label}
                className={`nav-item${active ? " is-active" : ""}`}
                style={{
                  position: "relative",
                  justifyContent: "center",
                  padding: "10px 0",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    color:
                      entry.tone === "topic" ? "var(--accent-red-soft)" : undefined,
                  }}
                >
                  <Icon id={entry.id} />
                </span>
                {dot && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 14,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent-red)",
                    }}
                  />
                )}
              </Link>
            );
          }

          return (
            <Link
              key={entry.id}
              href={entry.href}
              className={`nav-item${active ? " is-active" : ""}`}
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
              <span>{label}</span>
              {entry.badge && (
                <span className="ml-auto chip-dark">{entry.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer stats — hidden in collapsed mode (would be unreadable at 64px). */}
      {!collapsed && (
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
      )}

      {/* Collapse / Expand toggle — anchored to the very bottom. */}
      <div
        style={{
          padding: collapsed ? "10px 0" : "10px 16px",
          borderTop: "1px solid var(--rule-on-dark)",
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-pressed={collapsed}
          style={{
            background: "transparent",
            border: "1px solid var(--rule-on-dark)",
            color: "var(--ink-mute-on-dark)",
            cursor: "pointer",
            width: collapsed ? 32 : 28,
            height: collapsed ? 32 : 28,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color .12s ease, border-color .12s ease",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--accent-red-soft)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--ink-mute-on-dark)";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--rule-on-dark)";
          }}
        >
          <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
        </button>
      </div>
    </aside>
  );
}
