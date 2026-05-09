"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/**
 * Bridges next-intl's locale → <html data-lang="..."> AND mirrors it to
 * localStorage["rt-lang"] for legacy/visual parity with prototype v0.3.
 *
 * Why this exists:
 *   - The legacy prototype keyed off `<html data-lang>` for some CSS
 *     selectors and JS branching; we keep that contract intact.
 *   - localStorage mirror lets future client-only utilities (toasts,
 *     transient overlays) read the active locale without a server
 *     round-trip.
 */
export function LangThemeBridge() {
  const locale = useLocale();

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-lang") !== locale) {
      html.setAttribute("data-lang", locale);
    }
    try {
      window.localStorage.setItem("rt-lang", locale);
    } catch {
      /* storage may be blocked in iframes / private mode */
    }
  }, [locale]);

  return null;
}
