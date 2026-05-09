import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookie } from "./config";

/**
 * next-intl server hook. Resolves locale from the `rt-lang` cookie,
 * falling back to the default (zh).
 *
 * The matching JSON dictionary is loaded from /messages/<locale>.json.
 * These files were extracted 1:1 from legacy/prototype-v0.3/js/i18n.js
 * (1004 keys, zero loss — see scripts/extract_dict.mjs in commit history).
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookie)?.value;
  const locale = isLocale(fromCookie) ? fromCookie : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
