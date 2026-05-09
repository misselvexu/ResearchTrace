"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wraps next-themes so the rest of the app can simply import
 * { ThemeProvider } from "@/components/providers/theme-provider".
 *
 * We persist the theme on `<html data-theme="...">` so the legacy
 * tokens.css selectors (`:root[data-theme="dark"]`) keep working
 * unchanged. Storage key matches the legacy prototype's `rt-theme`
 * so users coming from v0.3 keep their preference.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider storageKey="rt-theme" {...props}>
      {children}
    </NextThemesProvider>
  );
}
