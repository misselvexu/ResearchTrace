"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, localeCookie, type Locale } from "./config";

/**
 * Server action invoked by the LangSwitcher to persist the user's
 * language choice. We set an HTTP cookie (read by the next-intl server
 * hook) AND let the client mirror it into localStorage for legacy parity.
 *
 * One-year expiry is consistent with the legacy prototype, which kept
 * the choice indefinitely in localStorage.
 */
export async function setLocale(next: string): Promise<{ ok: boolean; locale?: Locale }> {
  if (!isLocale(next)) return { ok: false };

  const store = await cookies();
  store.set(localeCookie, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { ok: true, locale: next };
}
