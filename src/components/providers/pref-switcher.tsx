"use client";

import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";

/**
 * Lang + theme switcher, visually 1:1 with legacy prototype v0.3
 * (`.rt-switch` block in tokens.css). Two segments separated by a hairline:
 *   [ZH | EN]   ·   [☀ / 🌙]
 *
 * - Locale switch goes through a server action (cookie) and revalidates
 *   the layout so server-rendered translations re-render.
 * - Theme toggle is fully client-side via next-themes.
 */
export function PrefSwitcher({ onDark = false }: { onDark?: boolean }) {
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const setLang = (next: "zh" | "en") => {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
    });
  };

  return (
    <div className={`rt-switch${onDark ? " on-dark" : ""}`} aria-label="Preferences">
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={locale === "zh"}
        style={{
          color: locale === "zh" ? "var(--accent-red)" : undefined,
          fontWeight: locale === "zh" ? 600 : 400,
        }}
        disabled={isPending}
      >
        ZH
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={locale === "en"}
        style={{
          color: locale === "en" ? "var(--accent-red)" : undefined,
          fontWeight: locale === "en" ? 600 : 400,
        }}
        disabled={isPending}
      >
        EN
      </button>
      <span className="divider" aria-hidden />
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <span className="rt-icon-moon" aria-hidden>
          🌙
        </span>
        <span className="rt-icon-sun" aria-hidden>
          ☀
        </span>
      </button>
    </div>
  );
}
