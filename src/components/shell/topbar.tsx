/**
 * TopBar — sticky header on top of the main content column.
 *
 * 1:1 visual port of legacy js/shell.js → buildTopbar(). Layout:
 *   [crumb (mono uppercase)]   [search box · ⌘K]   [PrefSwitcher]   [Inbox bell + 47]   [Avatar pill · 郁文]
 *
 * Uses next-intl `useTranslations()` so the username + search placeholder
 * track the active locale.
 */

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PrefSwitcher } from "@/components/providers/pref-switcher";
import { UserMenu } from "./user-menu";
import { UnreadBadge } from "./unread-badge";

interface TopBarProps {
  /** Crumb i18n key (preferred). E.g. "today.crumb". */
  crumbKey?: string;
  /** Plain-text crumb fallback when no key is supplied. */
  crumb?: string;
}

export function TopBar({ crumbKey, crumb }: TopBarProps) {
  const t = useTranslations();
  const crumbText = crumbKey ? t(crumbKey) : crumb || "RESEARCHTRACE / WORKSPACE";

  return (
    <header
      className="rt-topbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "var(--bg-overlay)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--divider)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 32px",
      }}
    >
      {/* Crumb */}
      <div
        className="font-mono rt-topbar-crumb"
        style={{
          fontSize: 11,
          letterSpacing: ".16em",
          color: "var(--ink-tertiary)",
          textTransform: "uppercase",
        }}
      >
        {crumbText}
      </div>

      {/* Search box (centered, 520px) — clickable, navigates to /search */}
      <div className="rt-topbar-search" style={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: 520, marginInline: "auto" }}>
        <Link
          href="/search"
          className="clickable"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            maxWidth: 520,
            background: "var(--bg-card)",
            border: "1px solid var(--divider)",
            borderRadius: 6,
            padding: "8px 14px",
            textDecoration: "none",
          }}
        >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--ink-tertiary)" }}
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span
              style={{
                color: "var(--ink-tertiary)",
                fontSize: 13,
                flex: 1,
              }}
            >
              {t("shell.search")}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                letterSpacing: ".1em",
                color: "var(--ink-tertiary)",
                border: "1px solid var(--divider)",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              ⌘K
            </span>
          </Link>
        </div>

        {/* Lang + theme */}
        <PrefSwitcher />

        {/* Inbox bell */}
        <Link
          href="/inbox"
          aria-label="Inbox"
          title="Inbox"
          className="clickable"
          style={{
            position: "relative",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--divider)",
            borderRadius: 4,
            color: "var(--ink-secondary)",
            textDecoration: "none",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
          <UnreadBadge />
        </Link>

        {/* User menu (avatar pill → dropdown with sign-out) */}
        <UserMenu />
    </header>
  );
}
