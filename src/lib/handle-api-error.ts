/**
 * handle-api-error — central mapper from `ApiError` to a localized toast.
 *
 * The 43 `errors.${ErrorCode}` keys (added in B8) provide localized copy for
 * every backend error code. This helper:
 *   - Catches `ApiError` and emits `toast.error(t("errors.<code>"))`.
 *   - Falls back to `t("errors.default")` for unknown codes / non-ApiError.
 *   - Optionally invokes a per-call override (e.g. show a different message
 *     for AuthEmailTaken inside the signup form).
 *
 * Usage:
 *   try {
 *     await api.post("/auth/login", body);
 *   } catch (e) {
 *     handleApiError(e, t);
 *   }
 *
 * Or with overrides (for code-specific UX):
 *   handleApiError(e, t, {
 *     10006: () => toast.warn(t("signup.alert.emailTaken")),
 *   });
 */

import { isApiError } from "@/lib/api";
import { toast } from "@/components/providers/toast";
import type { ErrorCode } from "@/types/api";

// next-intl's translator type is generic; we accept a structural shape
// that matches both the strict and loose hooks (`useTranslations()`).
type Translator = ((key: string) => string) & {
  has?: (key: string) => boolean;
};

export type ErrorOverrides = Partial<Record<ErrorCode, (e: Error) => void>>;

/**
 * Dispatch an error from a try/catch into the toast system.
 *
 * Returns the resolved message string (useful for tests / logging).
 */
export function handleApiError(
  err: unknown,
  t: Translator,
  overrides?: ErrorOverrides,
): string {
  // Non-ApiError → generic fallback.
  if (!isApiError(err)) {
    const msg = safeT(t, "errors.default");
    toast.error(msg);
    return msg;
  }

  // Per-call override wins.
  if (overrides && overrides[err.code]) {
    overrides[err.code]!(err);
    return err.message;
  }

  // Look up `errors.<code>`; fall back to `errors.default`.
  const key = `errors.${err.code}`;
  const localized = safeT(t, key);
  if (localized && localized !== key) {
    toast.error(localized);
    return localized;
  }
  const fallback = safeT(t, "errors.default");
  toast.error(fallback);
  return fallback;
}

/**
 * next-intl's `t()` throws on missing keys (in strict mode) but in our config
 * it returns the key as-is when not found. Either way, this wrapper protects
 * the toast pipeline from ever throwing.
 */
function safeT(t: Translator, key: string): string {
  try {
    if (typeof t.has === "function" && !t.has(key)) {
      return key;
    }
    return t(key);
  } catch {
    return key;
  }
}
