/**
 * Billing page — live overlay module.
 *
 * Provides typed read/save helpers for subscription, plans catalog,
 * payment methods, and invoices. Mutations: cancel/resume subscription,
 * change plan, request invoice PDF download URL, add/remove payment
 * methods. The editorial scaffold in `page.tsx` keeps its copywriter-
 * owned i18n keys; this module overlays numbers and states from the API.
 */

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-api-error";
import {
  invalidate,
  invoicesQuery,
  paymentMethodsQuery,
  plansQuery,
  subscriptionQuery,
  userPlanQuery,
} from "@/lib/queries";
import { toast } from "@/components/providers/toast";
import type {
  CancelSubscriptionResponse,
  ChangePlanRequest,
  ChangePlanResponse,
  Invoice,
  InvoicePdfResponse,
  ListPlansResponse,
  LocalizedText,
  PaymentMethod,
  Plan,
  PlanTier,
  ResumeSubscriptionResponse,
  Subscription,
  UserPlan,
} from "@/types/api";

// ---------------------------------------------------------------------------
// i18n util
// ---------------------------------------------------------------------------

export function pickLocale(
  text: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!text) return "";
  if (locale === "en") return text.en || text.zh || "";
  return text.zh || text.en || "";
}

// ---------------------------------------------------------------------------
// Combined live state
// ---------------------------------------------------------------------------

export interface BillingLive {
  subscription: Subscription | null;
  userPlan: UserPlan | null;
  plans: ListPlansResponse | null;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBillingLive(): BillingLive {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [plans, setPlans] = useState<ListPlansResponse | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      subscriptionQuery(),
      userPlanQuery(),
      plansQuery(),
      invoicesQuery(),
      paymentMethodsQuery(),
    ])
      .then(([sR, upR, plR, ivR, pmR]) => {
        if (cancelled) return;
        if (sR.status === "fulfilled") setSubscription(sR.value);
        if (upR.status === "fulfilled") setUserPlan(upR.value);
        if (plR.status === "fulfilled") setPlans(plR.value);
        if (ivR.status === "fulfilled") setInvoices(ivR.value.items);
        if (pmR.status === "fulfilled") setPaymentMethods(pmR.value.items);
        const failedAll =
          sR.status === "rejected" &&
          upR.status === "rejected" &&
          plR.status === "rejected" &&
          ivR.status === "rejected" &&
          pmR.status === "rejected";
        setError(failedAll ? "Failed to load billing" : null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    subscription,
    userPlan,
    plans,
    invoices,
    paymentMethods,
    loading,
    error,
    refresh: () => {
      invalidate([
        "billing.sub",
        "billing.plans",
        "billing.invoices",
        "billing.pm",
        "user.plan",
      ]);
      setTick((n) => n + 1);
    },
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

type T = (key: string) => string;

export async function cancelSubscription(t: T): Promise<Subscription | null> {
  try {
    const next = await api.post<CancelSubscriptionResponse, Record<string, never>>(
      "/billing/subscription/cancel",
      {},
    );
    invalidate(["billing.sub"]);
    toast.success(t("billing.alert.cancelConfirmed"));
    return next;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function resumeSubscription(t: T): Promise<Subscription | null> {
  try {
    const next = await api.post<ResumeSubscriptionResponse, Record<string, never>>(
      "/billing/subscription/resume",
      {},
    );
    invalidate(["billing.sub"]);
    toast.success(t("billing.alert.resumed"));
    return next;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function changePlan(
  body: ChangePlanRequest,
  t: T,
): Promise<Subscription | null> {
  try {
    const next = await api.post<ChangePlanResponse, ChangePlanRequest>(
      "/billing/subscription/change-plan",
      body,
    );
    invalidate(["billing.sub", "user.plan"]);
    toast.success(t("billing.alert.upgrade"));
    return next;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function downloadInvoicePdf(
  invoiceId: string,
  t: T,
): Promise<string | null> {
  try {
    const res = await api.get<InvoicePdfResponse>(
      `/billing/invoices/${invoiceId}/pdf`,
    );
    if (typeof window !== "undefined") {
      window.open(res.signedUrl, "_blank", "noopener,noreferrer");
    }
    toast.success(t("billing.alert.downloadInvoice"));
    return res.signedUrl;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function addPaymentMethod(t: T): Promise<string | null> {
  try {
    const res = await api.post<
      { setupIntentClientSecret: string; pendingPaymentMethodId: string },
      Record<string, never>
    >("/billing/payment-methods", {});
    invalidate(["billing.pm"]);
    toast.success(t("billing.alert.addMethod"));
    return res.pendingPaymentMethodId;
  } catch (err) {
    handleApiError(err, t);
    return null;
  }
}

export async function removePaymentMethod(
  id: string,
  t: T,
): Promise<boolean> {
  try {
    await api.delete<null>(`/billing/payment-methods/${id}`);
    invalidate(["billing.pm"]);
    toast.success(t("billing.alert.removeMethod"));
    return true;
  } catch (err) {
    handleApiError(err, t);
    return false;
  }
}

// ---------------------------------------------------------------------------
// View-model helpers
// ---------------------------------------------------------------------------

export function formatMoney(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  const sym =
    currency === "USD" ? "$" : currency === "CNY" ? "¥" : currency === "EUR" ? "€" : "";
  // No decimals when integer dollars (matches editorial style: $19, $190).
  const isInt = Math.round(major) === major;
  return `${sym}${isInt ? major : major.toFixed(2)}`;
}

export function formatBytes(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} GB`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} KB`;
  return `${n} B`;
}

export interface UsageOverlay {
  key: "ingest" | "claims" | "ask" | "storage";
  n: number;
  limit: number;
  display: string;
}

/** 4 usage cards derived from UserPlan.quotas (overlays editorial labels). */
export function usageFromPlan(plan: UserPlan | null): UsageOverlay[] | null {
  if (!plan) return null;
  const q = plan.quotas;
  return [
    {
      key: "ingest",
      n: q.briefsPerMonth.used,
      limit: q.briefsPerMonth.limit,
      display: `${q.briefsPerMonth.used} / ${q.briefsPerMonth.limit || "∞"}`,
    },
    {
      key: "claims",
      n: q.topics.used,
      limit: q.topics.limit,
      display: `${q.topics.used} / ${q.topics.limit || "∞"}`,
    },
    {
      key: "ask",
      n: q.askPerDay.used,
      limit: q.askPerDay.limit,
      display: `${q.askPerDay.used} / ${q.askPerDay.limit || "∞"}`,
    },
    {
      key: "storage",
      n: q.vaultBytes.used,
      limit: q.vaultBytes.limit,
      display: `${formatBytes(q.vaultBytes.used)} / ${formatBytes(q.vaultBytes.limit)}`,
    },
  ];
}

export interface PlanCardOverlay {
  name: string;
  price: string;
  per: string;
  renew: string;
  cancelled: boolean;
}

/** Pull plan card overlay from subscription + plans catalog. */
export function planCardOverlay(
  sub: Subscription | null,
  plans: ListPlansResponse | null,
  locale: string,
): PlanCardOverlay | null {
  if (!sub || !plans) return null;
  const plan = plans.plans.find((p) => p.tier === sub.planTier) ?? null;
  const price = plan?.prices?.[sub.interval];
  return {
    name: plan ? pickLocale(plan.name, locale) : sub.planTier.toUpperCase(),
    price: price ? formatMoney(price.amountMinor, price.currency) : "—",
    per: sub.interval === "yearly" ? "/yr" : "/mo",
    renew: sub.currentPeriodEnd.slice(0, 10),
    cancelled: sub.cancelAtPeriodEnd,
  };
}

export interface PaymentMethodOverlay {
  brand: string;
  last4: string;
  exp: string;
  isDefault: boolean;
}

export function paymentMethodOverlay(
  pms: PaymentMethod[],
): PaymentMethodOverlay | null {
  const def = pms.find((p) => p.isDefault) ?? pms[0];
  if (!def || !def.card) return null;
  return {
    brand: def.card.brand.toUpperCase(),
    last4: def.card.last4,
    exp: `${String(def.card.expMonth).padStart(2, "0")}/${String(def.card.expYear).slice(-2)}`,
    isDefault: def.isDefault,
  };
}

export interface InvoiceRow {
  id: string;
  date: string;
  number: string;
  amount: string;
  status: "paid" | "open" | "draft" | "void" | "uncollectible";
}

export function invoiceRows(items: Invoice[]): InvoiceRow[] {
  return items.map((inv) => ({
    id: inv.id,
    date: (inv.paidAt ?? inv.createdAt).slice(0, 10),
    number: inv.number,
    amount: formatMoney(inv.totalMinor, inv.currency),
    status:
      inv.status === "paid" || inv.status === "open" || inv.status === "draft"
        ? inv.status
        : inv.status,
  }));
}

/** Plan tier comparator helper for the compare table. */
export function findPlan(
  plans: ListPlansResponse | null,
  tier: PlanTier,
): Plan | null {
  if (!plans) return null;
  return plans.plans.find((p) => p.tier === tier) ?? null;
}
