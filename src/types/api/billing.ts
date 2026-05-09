/**
 * Billing Domain — plans, subscriptions, invoices, payment methods.
 *
 * Endpoints (see openapi/paths/billing.yaml):
 *   GET   /billing/plans                    (public — used by /pricing page)
 *   GET   /billing/subscription             (current user's active subscription)
 *   POST  /billing/subscription             (create — initiates checkout)
 *   POST  /billing/subscription/cancel      (cancel at period end)
 *   POST  /billing/subscription/resume      (un-cancel before period end)
 *   POST  /billing/subscription/change-plan (upgrade/downgrade with proration)
 *   GET   /billing/invoices                 (paginated)
 *   GET   /billing/invoices/{id}
 *   GET   /billing/invoices/{id}/pdf        (returns signed URL)
 *   GET   /billing/payment-methods
 *   POST  /billing/payment-methods          (returns Stripe SetupIntent client_secret)
 *   DELETE /billing/payment-methods/{id}
 *   POST  /billing/webhooks/stripe          (server-to-server; not for clients)
 *
 * Payment processor: Stripe (initial). Server hides Stripe primitives behind
 * this contract — frontend never imports `@stripe/stripe-js` types directly.
 */

import type {
  AuditFields,
  InvoiceId,
  LocalizedText,
  SubscriptionId,
  UserId,
} from "./_shared";
import type { PlanTier } from "./user";

// ============================================================================
// Plans (catalog)
// ============================================================================

export type BillingInterval = "monthly" | "yearly";
export type Currency = "USD" | "CNY" | "EUR";

/** PriceMoney — minor units (cents) to avoid float math. */
export interface PriceMoney {
  /** Amount in minor units. e.g. $19.00 = 1900. */
  amountMinor: number;
  currency: Currency;
}

export interface PlanFeature {
  /** Feature key (i18n lookup): `pricing.feature.${key}` */
  key: string;
  /** Bilingual label (denormalized for offline rendering). */
  label: LocalizedText;
  /** Whether this tier includes the feature. */
  included: boolean;
  /** Optional quantitative hint, e.g. "20 topics", "Unlimited". */
  quantity?: LocalizedText;
}

export interface Plan {
  tier: PlanTier;
  /** Bilingual display name (e.g. "专业版 / Pro"). */
  name: LocalizedText;
  /** Bilingual marketing tagline. */
  tagline: LocalizedText;
  /** Prices indexed by interval. `null` = not offered for that interval. */
  prices: {
    monthly: PriceMoney | null;
    yearly: PriceMoney | null;
  };
  features: PlanFeature[];
  /** UI hint: highlight this plan card. */
  highlighted: boolean;
  /** UI hint: show "Most Popular" ribbon. */
  popular: boolean;
  /** Quotas applied when this plan is active (mirrors UserPlan.quotas shape). */
  quotas: {
    topics: number;
    sources: number;
    vaultBytes: number;
    briefsPerMonth: number;
    askPerDay: number;
  };
}

export interface ListPlansResponse {
  plans: Plan[];
  /** Currency the prices are quoted in (geo-routed by backend). */
  resolvedCurrency: Currency;
}

// ============================================================================
// Subscription
// ============================================================================

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

export interface Subscription extends AuditFields {
  id: SubscriptionId;
  userId: UserId;
  planTier: PlanTier;
  interval: BillingInterval;
  status: SubscriptionStatus;
  /** Current billing period start. */
  currentPeriodStart: string;
  /** Current billing period end (next charge date). */
  currentPeriodEnd: string;
  /** True iff user has clicked "Cancel" but period hasn't ended. */
  cancelAtPeriodEnd: boolean;
  /** Trial end (null after trial). */
  trialEnd: string | null;
  /** ID of attached default payment method; null = none on file. */
  paymentMethodId: string | null;
}

export interface CreateSubscriptionRequest {
  planTier: Exclude<PlanTier, "free">;
  interval: BillingInterval;
  /** Optional Stripe payment method ID; if omitted, server returns checkout URL. */
  paymentMethodId?: string;
  /** Promo / coupon code. */
  couponCode?: string;
}

/**
 * Two response shapes (discriminated by `nextAction`):
 *   - "checkout"      → frontend redirects to `checkoutUrl`
 *   - "confirm"       → frontend confirms 3DS via Stripe.js using `clientSecret`
 *   - "active"        → subscription created and active (no further action)
 */
export type CreateSubscriptionResponse =
  | {
      nextAction: "checkout";
      checkoutUrl: string;
      subscriptionId: SubscriptionId;
    }
  | {
      nextAction: "confirm";
      clientSecret: string;
      subscriptionId: SubscriptionId;
    }
  | {
      nextAction: "active";
      subscription: Subscription;
    };

export interface ChangePlanRequest {
  planTier: Exclude<PlanTier, "free">;
  interval: BillingInterval;
  /** Whether to prorate immediately (true) or at period end (false). Default true. */
  prorateNow?: boolean;
}

export type ChangePlanResponse = Subscription;

export type CancelSubscriptionResponse = Subscription;
export type ResumeSubscriptionResponse = Subscription;

// ============================================================================
// Invoices
// ============================================================================

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface InvoiceLineItem {
  description: LocalizedText;
  amountMinor: number;
  quantity: number;
  /** Optional period this line covers. */
  periodStart?: string;
  periodEnd?: string;
}

export interface Invoice extends AuditFields {
  id: InvoiceId;
  userId: UserId;
  subscriptionId: SubscriptionId | null;
  number: string;
  status: InvoiceStatus;
  currency: Currency;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  /** ISO 8601; null until paid. */
  paidAt: string | null;
  /** Due date for `open` invoices; null when not applicable. */
  dueAt: string | null;
  lineItems: InvoiceLineItem[];
  /** Hosted invoice page URL (Stripe-style). */
  hostedUrl: string | null;
}

/** Request a signed PDF download URL (short-lived, ~5 min TTL). */
export interface InvoicePdfResponse {
  signedUrl: string;
  expiresAt: string;
}

// ============================================================================
// Payment methods
// ============================================================================

export type PaymentMethodType = "card" | "alipay" | "wechat_pay";

export interface PaymentMethodCardBrand {
  brand: "visa" | "mastercard" | "amex" | "discover" | "unionpay" | "other";
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface PaymentMethod extends AuditFields {
  id: string;
  userId: UserId;
  type: PaymentMethodType;
  /** Populated when type === "card". */
  card: PaymentMethodCardBrand | null;
  /** True iff this is the user's default payment method. */
  isDefault: boolean;
}

/**
 * Adding a payment method is a 2-step flow to keep PCI scope minimal:
 *   1. POST /billing/payment-methods with no body
 *      → returns Stripe SetupIntent `clientSecret`
 *   2. Frontend confirms with Stripe.js, which attaches the PM server-side via webhook
 *
 * The returned PaymentMethod arrives via WebSocket / SSE / next polling.
 */
export interface CreatePaymentMethodResponse {
  setupIntentClientSecret: string;
  /** ID assigned synchronously; the PM record materializes after Stripe confirms. */
  pendingPaymentMethodId: string;
}
