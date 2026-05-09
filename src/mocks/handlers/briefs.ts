/**
 * MSW handlers — Briefs domain.
 */

import { http, HttpResponse } from "msw";
import type {
  Brief,
  BriefExportResponse,
  BriefFeedbackRequest,
  BriefFeedbackResponse,
  CreateBriefRequest,
  ListBriefsQuery,
  ShareBriefResponse,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import { SEED_BRIEFS } from "../fixtures/seeds";

const API = "/api/v1";

let briefs: Brief[] = [...SEED_BRIEFS];

function applyFilters(list: Brief[], q: ListBriefsQuery): Brief[] {
  let out = [...list];
  if (q.topicId) out = out.filter((b) => b.topicId === q.topicId);
  if (q.status) out = out.filter((b) => b.status === q.status);
  if (q.cadence) out = out.filter((b) => b.cadence === q.cadence);
  if (q.since) out = out.filter((b) => b.createdAt >= q.since!);
  if (q.q) {
    const needle = q.q.toLowerCase();
    out = out.filter(
      (b) =>
        b.headline.zh.toLowerCase().includes(needle) ||
        b.headline.en.toLowerCase().includes(needle),
    );
  }
  const dir = q.direction === "asc" ? 1 : -1;
  switch (q.sort) {
    case "headline":
      out.sort((a, b) => dir * a.headline.en.localeCompare(b.headline.en));
      break;
    case "topic":
      out.sort((a, b) => dir * a.topicId.localeCompare(b.topicId));
      break;
    case "recent":
    default:
      out.sort((a, b) => dir * b.createdAt.localeCompare(a.createdAt));
  }
  return out;
}

export const briefsHandlers = [
  http.get(`${API}/briefs`, ({ request }) => {
    const q = readQuery<ListBriefsQuery & { cursor?: string }>(request);
    return HttpResponse.json(ok(paginate(applyFilters(briefs, q), q)));
  }),

  http.post(`${API}/briefs`, async ({ request }) => {
    const body = (await request.json()) as CreateBriefRequest;
    const id = `b_${String(briefs.length + 1).padStart(3, "0")}` as Brief["id"];
    const now = new Date().toISOString();
    const created: Brief = {
      id,
      ownerId: briefs[0].ownerId,
      topicId: body.topicId,
      status: "queued",
      cadence: body.cadence ?? "ad_hoc",
      windowStart: body.windowStart ?? now,
      windowEnd: body.windowEnd ?? now,
      headline: { zh: "排队中", en: "Queued" },
      deck: null,
      sections: [],
      highlightClaimIds: [],
      wordCount: 0,
      readingTimeMin: 0,
      generationStats: null,
      feedback: { upvotes: 0, downvotes: 0, myVote: null },
      savedToVault: false,
      shareToken: null,
      createdAt: now,
      updatedAt: now,
    };
    briefs = [created, ...briefs];
    return HttpResponse.json(ok(created), { status: 202 });
  }),

  http.get(`${API}/briefs/:id`, ({ params }) => {
    const b = briefs.find((x) => x.id === params.id);
    if (!b)
      return HttpResponse.json(err(ErrorCode.BriefNotFound, "Brief not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(b));
  }),

  http.post(`${API}/briefs/:id/regenerate`, ({ params }) => {
    const idx = briefs.findIndex((b) => b.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.BriefNotFound, "Brief not found"), {
        status: 404,
      });
    briefs[idx] = { ...briefs[idx], status: "queued", updatedAt: new Date().toISOString() };
    return HttpResponse.json(ok(briefs[idx]), { status: 202 });
  }),

  http.post(`${API}/briefs/:id/save`, ({ params }) => {
    const idx = briefs.findIndex((b) => b.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.BriefNotFound, "Brief not found"), {
        status: 404,
      });
    briefs[idx] = { ...briefs[idx], savedToVault: true };
    return HttpResponse.json(ok(briefs[idx]));
  }),

  http.post(`${API}/briefs/:id/share`, ({ params }) => {
    const idx = briefs.findIndex((b) => b.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.BriefNotFound, "Brief not found"), {
        status: 404,
      });
    const token = `share_${Date.now().toString(36)}`;
    briefs[idx] = { ...briefs[idx], shareToken: token };
    const payload: ShareBriefResponse = {
      shareToken: token,
      shareUrl: `https://researchtrace.com/share/${token}`,
      expiresAt: null,
    };
    return HttpResponse.json(ok(payload));
  }),

  http.post(`${API}/briefs/:id/feedback`, async ({ params, request }) => {
    const body = (await request.json()) as BriefFeedbackRequest;
    const idx = briefs.findIndex((b) => b.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.BriefNotFound, "Brief not found"), {
        status: 404,
      });
    const cur = briefs[idx].feedback;
    let upvotes = cur.upvotes;
    let downvotes = cur.downvotes;
    if (cur.myVote === "up") upvotes -= 1;
    if (cur.myVote === "down") downvotes -= 1;
    if (body.vote === "up") upvotes += 1;
    if (body.vote === "down") downvotes += 1;
    const updated: BriefFeedbackResponse = { upvotes, downvotes, myVote: body.vote };
    briefs[idx] = { ...briefs[idx], feedback: updated };
    return HttpResponse.json(ok(updated));
  }),

  http.get(`${API}/briefs/:id/export`, ({ params, request }) => {
    const url = new URL(request.url);
    const format = (url.searchParams.get("format") ?? "markdown") as
      | "markdown" | "pdf" | "html";
    const b = briefs.find((x) => x.id === params.id);
    if (!b)
      return HttpResponse.json(err(ErrorCode.BriefNotFound, "Brief not found"), {
        status: 404,
      });
    const expires = new Date(Date.now() + 5 * 60_000).toISOString();
    const payload: BriefExportResponse = {
      format,
      signedUrl: `https://cdn.researchtrace.com/exports/${b.id}.${format}?sig=mock`,
      expiresAt: expires,
    };
    return HttpResponse.json(ok(payload));
  }),
];
