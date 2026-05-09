/**
 * MSW handlers — Notifications domain.
 */

import { http, HttpResponse } from "msw";
import type {
  ListNotificationsQuery,
  Notification,
  NotificationChannel,
  NotificationKind,
  NotificationPreferences,
  UnreadCountResponse,
  UpdateNotificationPreferencesRequest,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import { SEED_NOTIFICATIONS } from "../fixtures/seeds";

const API = "/api/v1";

let notifications: Notification[] = [...SEED_NOTIFICATIONS];

const ALL_KINDS: NotificationKind[] = [
  "brief_ready",
  "topic_heat_spike",
  "agent_finished",
  "agent_failed",
  "source_error",
  "billing_invoice",
  "billing_payment_failed",
  "billing_trial_ending",
  "account_security",
  "system_announcement",
];

const ALL_CHANNELS: NotificationChannel[] = ["in_app", "email", "push"];

function defaultPrefs(): NotificationPreferences {
  const out = {} as NotificationPreferences;
  for (const k of ALL_KINDS) {
    out[k] = {
      in_app: true,
      email: k.startsWith("billing_") || k === "account_security",
      push: false,
    };
    void ALL_CHANNELS;
  }
  return out;
}

let preferences: NotificationPreferences = defaultPrefs();

const SEVERITY_ORDER = { info: 0, success: 1, warning: 2, critical: 3 } as const;

export const notificationsHandlers = [
  http.get(`${API}/notifications`, ({ request }) => {
    const q = readQuery<ListNotificationsQuery & { cursor?: string }>(request);
    let out = [...notifications];
    switch (q.filter) {
      case "unread":
        out = out.filter((n) => !n.read);
        break;
      case "read":
        out = out.filter((n) => n.read);
        break;
    }
    if (q.kind) out = out.filter((n) => n.kind === q.kind);
    if (q.severity) out = out.filter((n) => n.severity === q.severity);
    if (q.topicId) out = out.filter((n) => n.topicId === q.topicId);
    out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(ok(paginate(out, q)));
  }),

  http.get(`${API}/notifications/:id`, ({ params }) => {
    const n = notifications.find((x) => x.id === params.id);
    if (!n)
      return HttpResponse.json(err(ErrorCode.NotificationNotFound, "Not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(n));
  }),

  http.post(`${API}/notifications/:id/read`, ({ params }) => {
    const idx = notifications.findIndex((n) => n.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.NotificationNotFound, "Not found"), {
        status: 404,
      });
    notifications[idx] = { ...notifications[idx], read: true };
    return HttpResponse.json(ok(notifications[idx]));
  }),

  http.post(`${API}/notifications/read-all`, () => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return HttpResponse.json(ok({ updated: notifications.length }));
  }),

  http.delete(`${API}/notifications/:id`, ({ params }) => {
    const before = notifications.length;
    notifications = notifications.filter((n) => n.id !== params.id);
    if (notifications.length === before)
      return HttpResponse.json(err(ErrorCode.NotificationNotFound, "Not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(null));
  }),

  http.get(`${API}/notifications/unread-count`, () => {
    const unread = notifications.filter((n) => !n.read);
    let topSeverity: UnreadCountResponse["topSeverity"] = null;
    for (const n of unread) {
      if (
        topSeverity === null ||
        SEVERITY_ORDER[n.severity] > SEVERITY_ORDER[topSeverity]
      ) {
        topSeverity = n.severity;
      }
    }
    const payload: UnreadCountResponse = { unread: unread.length, topSeverity };
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/notifications/preferences`, () =>
    HttpResponse.json(ok(preferences)),
  ),

  http.put(`${API}/notifications/preferences`, async ({ request }) => {
    const body = (await request.json()) as UpdateNotificationPreferencesRequest;
    preferences = { ...preferences, ...body.preferences } as NotificationPreferences;
    return HttpResponse.json(ok(preferences));
  }),
];
