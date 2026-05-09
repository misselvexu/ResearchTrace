/**
 * MSW handlers — Inbox domain.
 */

import { http, HttpResponse } from "msw";
import type {
  InboxBulkRequest,
  InboxBulkResponse,
  InboxCounters,
  InboxItem,
  ListInboxQuery,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import { SEED_INBOX } from "../fixtures/seeds";

const API = "/api/v1";

let items: InboxItem[] = [...SEED_INBOX];

function applyFilters(list: InboxItem[], q: ListInboxQuery): InboxItem[] {
  let out = [...list];
  switch (q.filter) {
    case "unread":
      out = out.filter((i) => !i.read && !i.dismissed);
      break;
    case "starred":
      out = out.filter((i) => i.starred);
      break;
    case "dismissed":
      out = out.filter((i) => i.dismissed);
      break;
    case "all":
    default:
      out = out.filter((i) => !i.dismissed);
  }
  if (q.topicId) out = out.filter((i) => i.topicIds.includes(q.topicId!));
  if (q.sourceId) out = out.filter((i) => i.sourceId === q.sourceId);
  if (q.kind) out = out.filter((i) => i.kind === q.kind);
  if (q.q) {
    const needle = q.q.toLowerCase();
    out = out.filter(
      (i) =>
        i.headline.zh.toLowerCase().includes(needle) ||
        i.headline.en.toLowerCase().includes(needle),
    );
  }
  if (q.since) out = out.filter((i) => i.receivedAt >= q.since!);

  const dir = q.direction === "asc" ? 1 : -1;
  switch (q.sort) {
    case "oldest":
      out.sort((a, b) => dir * a.receivedAt.localeCompare(b.receivedAt));
      break;
    case "topic":
      out.sort((a, b) => dir * (a.topicIds[0] ?? "").localeCompare(b.topicIds[0] ?? ""));
      break;
    case "source":
      out.sort((a, b) => dir * (a.sourceId ?? "").localeCompare(b.sourceId ?? ""));
      break;
    case "recent":
    default:
      out.sort((a, b) => dir * b.receivedAt.localeCompare(a.receivedAt));
  }
  return out;
}

function patchItem(id: string, patch: Partial<InboxItem>): InboxItem | null {
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], ...patch } as InboxItem;
  return items[idx];
}

export const inboxHandlers = [
  http.get(`${API}/inbox`, ({ request }) => {
    const q = readQuery<ListInboxQuery & { cursor?: string }>(request);
    return HttpResponse.json(ok(paginate(applyFilters(items, q), q)));
  }),

  http.get(`${API}/inbox/:id`, ({ params }) => {
    const it = items.find((i) => i.id === params.id);
    if (!it)
      return HttpResponse.json(err(ErrorCode.InboxItemNotFound, "Item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(it));
  }),

  http.post(`${API}/inbox/:id/read`, ({ params }) => {
    const updated = patchItem(params.id as string, { read: true });
    if (!updated)
      return HttpResponse.json(err(ErrorCode.InboxItemNotFound, "Item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(updated));
  }),

  http.post(`${API}/inbox/:id/unread`, ({ params }) => {
    const updated = patchItem(params.id as string, { read: false });
    if (!updated)
      return HttpResponse.json(err(ErrorCode.InboxItemNotFound, "Item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(updated));
  }),

  http.post(`${API}/inbox/:id/star`, ({ params }) => {
    const updated = patchItem(params.id as string, { starred: true });
    if (!updated)
      return HttpResponse.json(err(ErrorCode.InboxItemNotFound, "Item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(updated));
  }),

  http.post(`${API}/inbox/:id/unstar`, ({ params }) => {
    const updated = patchItem(params.id as string, { starred: false });
    if (!updated)
      return HttpResponse.json(err(ErrorCode.InboxItemNotFound, "Item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(updated));
  }),

  http.post(`${API}/inbox/:id/dismiss`, ({ params }) => {
    const updated = patchItem(params.id as string, { dismissed: true });
    if (!updated)
      return HttpResponse.json(err(ErrorCode.InboxItemNotFound, "Item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(updated));
  }),

  http.post(`${API}/inbox/:id/save`, ({ params }) => {
    const updated = patchItem(params.id as string, { savedToVault: true });
    if (!updated)
      return HttpResponse.json(err(ErrorCode.InboxItemNotFound, "Item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(updated));
  }),

  http.post(`${API}/inbox/bulk`, async ({ request }) => {
    const body = (await request.json()) as InboxBulkRequest;
    let applied = 0;
    const failedIds: typeof body.ids = [];
    for (const id of body.ids) {
      const idx = items.findIndex((i) => i.id === id);
      if (idx < 0) {
        failedIds.push(id);
        continue;
      }
      switch (body.action) {
        case "read":    items[idx] = { ...items[idx], read: true } as InboxItem; break;
        case "unread":  items[idx] = { ...items[idx], read: false } as InboxItem; break;
        case "star":    items[idx] = { ...items[idx], starred: true } as InboxItem; break;
        case "unstar":  items[idx] = { ...items[idx], starred: false } as InboxItem; break;
        case "dismiss": items[idx] = { ...items[idx], dismissed: true } as InboxItem; break;
        case "save":    items[idx] = { ...items[idx], savedToVault: true } as InboxItem; break;
      }
      applied += 1;
    }
    const payload: InboxBulkResponse = { applied, failedIds };
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/inbox/counters`, () => {
    const unread = items.filter((i) => !i.read && !i.dismissed).length;
    const starred = items.filter((i) => i.starred).length;
    const total = items.filter((i) => !i.dismissed).length;
    const byTopicMap = new Map<string, number>();
    for (const i of items) {
      if (i.read || i.dismissed) continue;
      for (const t of i.topicIds) byTopicMap.set(t, (byTopicMap.get(t) ?? 0) + 1);
    }
    const payload: InboxCounters = {
      unread,
      starred,
      total,
      byTopic: Array.from(byTopicMap.entries())
        .map(([topicId, n]) => ({ topicId: topicId as InboxCounters["byTopic"][number]["topicId"], unread: n }))
        .sort((a, b) => b.unread - a.unread)
        .slice(0, 10),
    };
    return HttpResponse.json(ok(payload));
  }),
];
