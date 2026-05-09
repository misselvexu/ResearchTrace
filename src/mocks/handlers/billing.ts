/**
 * MSW handlers — Billing domain.
 */

import { http, HttpResponse } from "msw";
import type {
  CancelSubscriptionResponse,
  ChangePlanRequest,
  ChangePlanResponse,
  CreatePaymentMethodResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  InvoicePdfResponse,
  ListPlansResponse,
  ResumeSubscriptionResponse,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import {
  SEED_INVOICES,
  SEED_PAYMENT_METHODS,
  SEED_PLANS,
  SEED_SUBSCRIPTION,
} from "../fixtures/seeds";

const API = "/api/v1";

let subscription = { ...SEED_SUBSCRIPTION };
const invoices = [...SEED_INVOICES];
let paymentMethods = [...SEED_PAYMENT_METHODS];

export const billingHandlers = [
  http.get(`${API}/billing/plans`, () => {
    const payload: ListPlansResponse = { plans: SEED_PLANS, resolvedCurrency: "USD" };
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/billing/subscription`, () => HttpResponse.json(ok(subscription))),

  http.post(`${API}/billing/subscription`, async ({ request }) => {
    const body = (await request.json()) as CreateSubscriptionRequest;
    if (!body.paymentMethodId) {
      const payload: CreateSubscriptionResponse = {
        nextAction: "checkout",
        checkoutUrl: `https://checkout.researchtrace.com/sub_${Date.now().toString(36)}`,
        subscriptionId: subscription.id,
      };
      return HttpResponse.json(ok(payload));
    }
    subscription = {
      ...subscription,
      planTier: body.planTier,
      interval: body.interval,
      status: "active",
      cancelAtPeriodEnd: false,
      updatedAt: new Date().toISOString(),
    };
    const payload: CreateSubscriptionResponse = {
      nextAction: "active",
      subscription,
    };
    return HttpResponse.json(ok(payload));
  }),

  http.post(`${API}/billing/subscription/cancel`, () => {
    subscription = {
      ...subscription,
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString(),
    };
    const payload: CancelSubscriptionResponse = subscription;
    return HttpResponse.json(ok(payload));
  }),

  http.post(`${API}/billing/subscription/resume`, () => {
    subscription = {
      ...subscription,
      cancelAtPeriodEnd: false,
      updatedAt: new Date().toISOString(),
    };
    const payload: ResumeSubscriptionResponse = subscription;
    return HttpResponse.json(ok(payload));
  }),

  http.post(`${API}/billing/subscription/change-plan`, async ({ request }) => {
    const body = (await request.json()) as ChangePlanRequest;
    subscription = {
      ...subscription,
      planTier: body.planTier,
      interval: body.interval,
      updatedAt: new Date().toISOString(),
    };
    const payload: ChangePlanResponse = subscription;
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/billing/invoices`, ({ request }) => {
    const q = readQuery<{ cursor?: string; limit?: number }>(request);
    return HttpResponse.json(ok(paginate(invoices, q)));
  }),

  http.get(`${API}/billing/invoices/:id`, ({ params }) => {
    const inv = invoices.find((i) => i.id === params.id);
    if (!inv)
      return HttpResponse.json(err(ErrorCode.NotFound, "Invoice not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(inv));
  }),

  http.get(`${API}/billing/invoices/:id/pdf`, ({ params }) => {
    const inv = invoices.find((i) => i.id === params.id);
    if (!inv)
      return HttpResponse.json(err(ErrorCode.NotFound, "Invoice not found"), {
        status: 404,
      });
    const payload: InvoicePdfResponse = {
      signedUrl: `https://cdn.researchtrace.com/invoices/${inv.id}.pdf?sig=mock`,
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    };
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/billing/payment-methods`, () =>
    HttpResponse.json(ok({ items: paymentMethods })),
  ),

  http.post(`${API}/billing/payment-methods`, () => {
    const payload: CreatePaymentMethodResponse = {
      setupIntentClientSecret: `seti_mock_${Date.now().toString(36)}_secret`,
      pendingPaymentMethodId: `pm_pending_${Date.now().toString(36)}`,
    };
    return HttpResponse.json(ok(payload));
  }),

  http.delete(`${API}/billing/payment-methods/:id`, ({ params }) => {
    const before = paymentMethods.length;
    paymentMethods = paymentMethods.filter((p) => p.id !== params.id);
    if (paymentMethods.length === before)
      return HttpResponse.json(err(ErrorCode.NotFound, "Payment method not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(null));
  }),
];
