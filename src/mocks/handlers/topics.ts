/**
 * MSW handlers — Topics domain.
 */

import { http, HttpResponse } from "msw";
import type {
  CreateTopicRequest,
  ListTopicFeedQuery,
  ListTopicsQuery,
  Topic,
  TopicId,
  TopicStats,
  UpdateTopicRequest,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import { SEED_TOPIC_FEED, SEED_TOPICS } from "../fixtures/seeds";

const API = "/api/v1";

let topics: Topic[] = [...SEED_TOPICS];

function findTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

function applyFilters(list: Topic[], q: ListTopicsQuery): Topic[] {
  let out = [...list];
  if (q.q) {
    const needle = q.q.toLowerCase();
    out = out.filter(
      (t) =>
        t.name.zh.toLowerCase().includes(needle) ||
        t.name.en.toLowerCase().includes(needle) ||
        t.keywords.some((k) => k.toLowerCase().includes(needle)),
    );
  }
  if (q.status) out = out.filter((t) => t.status === q.status);
  if (q.pinned !== undefined) out = out.filter((t) => t.pinned === q.pinned);
  if (q.color) out = out.filter((t) => t.color === q.color);

  const dir = q.direction === "asc" ? 1 : -1;
  switch (q.sort) {
    case "alphabetical":
      out.sort((a, b) => dir * a.name.en.localeCompare(b.name.en));
      break;
    case "activity":
      out.sort((a, b) => dir * (b.recentItemCount - a.recentItemCount));
      break;
    case "heat":
      out.sort((a, b) => dir * (b.heat - a.heat));
      break;
    case "recent":
    default:
      out.sort(
        (a, b) =>
          dir *
          ((b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? "")),
      );
  }
  return out;
}

export const topicsHandlers = [
  http.get(`${API}/topics`, ({ request }) => {
    const q = readQuery<ListTopicsQuery & { cursor?: string }>(request);
    const filtered = applyFilters(topics, q);
    return HttpResponse.json(ok(paginate(filtered, q)));
  }),

  http.post(`${API}/topics`, async ({ request }) => {
    const body = (await request.json()) as CreateTopicRequest;
    const id = `t_${String(topics.length + 1).padStart(3, "0")}` as TopicId;
    const now = new Date().toISOString();
    const created: Topic = {
      id,
      ownerId: topics[0].ownerId,
      name: body.name,
      summary: body.summary ?? null,
      keywords: body.keywords,
      sourceIds: body.sourceIds,
      color: body.color ?? "neutral",
      status: "active",
      pinned: body.pinned ?? false,
      muted: false,
      heat: 0,
      recentItemCount: 0,
      lastActivityAt: null,
      lastBrief: null,
      createdAt: now,
      updatedAt: now,
    };
    topics = [created, ...topics];
    return HttpResponse.json(ok(created), { status: 201 });
  }),

  http.get(`${API}/topics/:id`, ({ params }) => {
    const t = findTopic(params.id as string);
    if (!t) {
      return HttpResponse.json(err(ErrorCode.TopicNotFound, "Topic not found"), {
        status: 404,
      });
    }
    return HttpResponse.json(ok(t));
  }),

  http.patch(`${API}/topics/:id`, async ({ params, request }) => {
    const body = (await request.json()) as UpdateTopicRequest;
    const idx = topics.findIndex((t) => t.id === params.id);
    if (idx < 0) {
      return HttpResponse.json(err(ErrorCode.TopicNotFound, "Topic not found"), {
        status: 404,
      });
    }
    const updated: Topic = {
      ...topics[idx],
      ...(body.name !== undefined && { name: body.name }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.keywords !== undefined && { keywords: body.keywords }),
      ...(body.sourceIds !== undefined && { sourceIds: body.sourceIds }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.muted !== undefined && { muted: body.muted }),
      updatedAt: new Date().toISOString(),
    };
    topics[idx] = updated;
    return HttpResponse.json(ok(updated));
  }),

  http.delete(`${API}/topics/:id`, ({ params }) => {
    const before = topics.length;
    topics = topics.filter((t) => t.id !== params.id);
    if (topics.length === before) {
      return HttpResponse.json(err(ErrorCode.TopicNotFound, "Topic not found"), {
        status: 404,
      });
    }
    return HttpResponse.json(ok(null));
  }),

  http.post(`${API}/topics/:id/pin`, ({ params }) => {
    const idx = topics.findIndex((t) => t.id === params.id);
    if (idx < 0) {
      return HttpResponse.json(err(ErrorCode.TopicNotFound, "Topic not found"), {
        status: 404,
      });
    }
    topics[idx] = { ...topics[idx], pinned: true, updatedAt: new Date().toISOString() };
    return HttpResponse.json(ok(topics[idx]));
  }),

  http.post(`${API}/topics/:id/unpin`, ({ params }) => {
    const idx = topics.findIndex((t) => t.id === params.id);
    if (idx < 0) {
      return HttpResponse.json(err(ErrorCode.TopicNotFound, "Topic not found"), {
        status: 404,
      });
    }
    topics[idx] = { ...topics[idx], pinned: false, updatedAt: new Date().toISOString() };
    return HttpResponse.json(ok(topics[idx]));
  }),

  http.get(`${API}/topics/:id/feed`, ({ params, request }) => {
    const q = readQuery<ListTopicFeedQuery & { cursor?: string }>(request);
    const t = findTopic(params.id as string);
    if (!t) {
      return HttpResponse.json(err(ErrorCode.TopicNotFound, "Topic not found"), {
        status: 404,
      });
    }
    const items = SEED_TOPIC_FEED[params.id as string] ?? [];
    return HttpResponse.json(ok(paginate(items, q)));
  }),

  http.get(`${API}/topics/:id/stats`, ({ params }) => {
    const t = findTopic(params.id as string);
    if (!t) {
      return HttpResponse.json(err(ErrorCode.TopicNotFound, "Topic not found"), {
        status: 404,
      });
    }
    const stats: TopicStats = {
      topicId: t.id,
      heatSeries: [55, 62, 71, 68, 79, 84, t.heat],
      volumeSeries: [4, 6, 9, 7, 11, 14, 12],
      topSources: [],
      topKeywords: t.keywords.map((term, i) => ({ term, weight: 1 - i * 0.1 })),
    };
    return HttpResponse.json(ok(stats));
  }),
];
