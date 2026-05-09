/**
 * i18n configuration shared by server and client.
 *
 * Locales: zh (Simplified Chinese, default) and en (English).
 *
 * Persistence:
 *   - Cookie:        `rt-lang`   (read by server components via next-intl)
 *   - localStorage:  `rt-lang`   (kept for legacy parity & client switcher)
 *
 * On switch, the LangSwitcher writes BOTH so the choice survives both
 * full reloads (cookie) and pure client navigations (localStorage).
 */

export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";
export const localeCookie = "rt-lang";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "zh" || value === "en";
}
