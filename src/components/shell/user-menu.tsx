"use client";

/**
 * UserMenu — avatar pill in the TopBar that expands into a dropdown
 * with the user's identity, quick links to public pages, and a
 * Sign-out action.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getSession, signOut } from "@/lib/auth";
import { toast } from "@/components/providers/toast";

export function UserMenu() {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = getSession();
    if (s?.authed) {
      setName(s.name || t("shell.userName"));
      setEmail(s.email || "");
    } else {
      setName(t("shell.userName"));
    }
  }, [t]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function handleSignOut() {
    signOut();
    toast.success(t("userMenu.signedOut"));
    setOpen(false);
    router.replace("/landing");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="clickable"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px 4px 4px",
          border: "1px solid var(--divider)",
          borderRadius: 20,
          background: "transparent",
          color: "var(--ink-primary)",
          cursor: "pointer",
          font: "inherit",
        }}
      >
        <Image
          src="/img/avatar.png"
          alt=""
          width={24}
          height={24}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            objectFit: "cover",
            background: "var(--bg-paper-deep)",
          }}
        />
        <span style={{ fontSize: 12 }}>{name}</span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 12 12"
          aria-hidden
          style={{ color: "var(--ink-tertiary)" }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 240,
            background: "var(--bg-card)",
            border: "1px solid var(--divider)",
            borderRadius: 6,
            boxShadow: "var(--shadow-lift)",
            padding: 6,
            zIndex: 60,
            fontSize: 13,
          }}
        >
          {/* Identity row */}
          {email ? (
            <div
              style={{
                padding: "10px 12px 8px",
                borderBottom: "1px solid var(--divider)",
                marginBottom: 4,
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--ink-primary)" }}>{name}</div>
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-tertiary)",
                  letterSpacing: ".04em",
                  marginTop: 2,
                  wordBreak: "break-all",
                }}
              >
                {email}
              </div>
            </div>
          ) : null}

          {/* Quick links — workspace + public */}
          {[
            { href: "/settings", labelK: "userMenu.settings" },
            { href: "/billing", labelK: "userMenu.billing" },
            { href: "/notifications", labelK: "userMenu.notifications" },
          ].map((it) => (
            <Link
              key={it.href}
              href={it.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "8px 12px",
                color: "var(--ink-primary)",
                textDecoration: "none",
                borderRadius: 4,
              }}
            >
              {t(it.labelK)}
            </Link>
          ))}

          <div style={{ height: 1, background: "var(--divider)", margin: "6px 0" }} />

          {[
            { href: "/pricing", labelK: "userMenu.pricing" },
            { href: "/about", labelK: "userMenu.about" },
            { href: "/changelog", labelK: "userMenu.changelog" },
          ].map((it) => (
            <Link
              key={it.href}
              href={it.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "8px 12px",
                color: "var(--ink-secondary)",
                textDecoration: "none",
                borderRadius: 4,
              }}
            >
              {t(it.labelK)}
            </Link>
          ))}

          <div style={{ height: 1, background: "var(--divider)", margin: "6px 0" }} />

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              color: "var(--accent-red)",
              cursor: "pointer",
              font: "inherit",
              borderRadius: 4,
            }}
          >
            {t("userMenu.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
