/**
 * MSW handlers — Ask domain.
 *
 * Note: real backend streams replies via SSE on POST /ask/sessions/{id}/messages.
 * MSW supports streaming via ReadableStream — we emit a sequence of
 * `data: <json>\n\n` frames matching the AskStreamEvent schema.
 */

import { http, HttpResponse } from "msw";
import type {
  AskMessage,
  AskSession,
  AskStreamEvent,
  CreateSessionRequest,
  ListSessionsQuery,
  ListSuggestionsResponse,
  MessageFeedbackRequest,
  MessageFeedbackResponse,
  SendMessageRequest,
  UpdateSessionRequest,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import {
  SEED_ASK_MESSAGES,
  SEED_ASK_SESSIONS,
  SEED_ASK_SUGGESTIONS,
} from "../fixtures/seeds";

const API = "/api/v1";

let sessions: AskSession[] = [...SEED_ASK_SESSIONS];
let messages: AskMessage[] = [...SEED_ASK_MESSAGES];

function encodeSse(event: AskStreamEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export const askHandlers = [
  http.get(`${API}/ask/sessions`, ({ request }) => {
    const q = readQuery<ListSessionsQuery & { cursor?: string }>(request);
    let out = [...sessions];
    if (q.archived !== undefined) out = out.filter((s) => s.archived === q.archived);
    if (q.q) {
      const needle = q.q.toLowerCase();
      out = out.filter(
        (s) =>
          s.title.zh.toLowerCase().includes(needle) ||
          s.title.en.toLowerCase().includes(needle),
      );
    }
    const dir = q.direction === "asc" ? 1 : -1;
    switch (q.sort) {
      case "alphabetical":
        out.sort((a, b) => dir * a.title.en.localeCompare(b.title.en));
        break;
      case "messages":
        out.sort((a, b) => dir * (b.messageCount - a.messageCount));
        break;
      case "recent":
      default:
        out.sort(
          (a, b) =>
            dir * ((b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "")),
        );
    }
    return HttpResponse.json(ok(paginate(out, q)));
  }),

  http.post(`${API}/ask/sessions`, async ({ request }) => {
    const body = (await request.json()) as CreateSessionRequest;
    const now = new Date().toISOString();
    const created: AskSession = {
      id: `as_${String(sessions.length + 1).padStart(3, "0")}` as AskSession["id"],
      ownerId: sessions[0].ownerId,
      title: body.title ?? { zh: "新会话", en: "New session" },
      defaultScope: body.defaultScope ?? { kind: "mixed", includeWeb: true },
      messageCount: 0,
      lastMessageAt: null,
      archived: false,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    sessions = [created, ...sessions];
    return HttpResponse.json(ok(created), { status: 201 });
  }),

  http.get(`${API}/ask/sessions/:id`, ({ params }) => {
    const s = sessions.find((x) => x.id === params.id);
    if (!s)
      return HttpResponse.json(err(ErrorCode.AskSessionNotFound, "Session not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(s));
  }),

  http.patch(`${API}/ask/sessions/:id`, async ({ params, request }) => {
    const body = (await request.json()) as UpdateSessionRequest;
    const idx = sessions.findIndex((s) => s.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.AskSessionNotFound, "Session not found"), {
        status: 404,
      });
    sessions[idx] = {
      ...sessions[idx],
      ...(body.title !== undefined && { title: body.title }),
      ...(body.defaultScope !== undefined && { defaultScope: body.defaultScope }),
      ...(body.archived !== undefined && { archived: body.archived }),
      ...(body.pinned !== undefined && { pinned: body.pinned }),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(ok(sessions[idx]));
  }),

  http.delete(`${API}/ask/sessions/:id`, ({ params }) => {
    const before = sessions.length;
    sessions = sessions.filter((s) => s.id !== params.id);
    if (sessions.length === before)
      return HttpResponse.json(err(ErrorCode.AskSessionNotFound, "Session not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(null));
  }),

  http.get(`${API}/ask/sessions/:id/messages`, ({ params, request }) => {
    const s = sessions.find((x) => x.id === params.id);
    if (!s)
      return HttpResponse.json(err(ErrorCode.AskSessionNotFound, "Session not found"), {
        status: 404,
      });
    const q = readQuery<{ cursor?: string; limit?: number }>(request);
    const out = messages
      .filter((m) => m.sessionId === s.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return HttpResponse.json(ok(paginate(out, q)));
  }),

  http.post(`${API}/ask/sessions/:id/messages`, async ({ params, request }) => {
    const s = sessions.find((x) => x.id === params.id);
    if (!s)
      return HttpResponse.json(err(ErrorCode.AskSessionNotFound, "Session not found"), {
        status: 404,
      });
    const body = (await request.json()) as SendMessageRequest;
    const now = new Date().toISOString();

    // Persist the user's message immediately.
    const userMsg: AskMessage = {
      id: `am_${String(messages.length + 1).padStart(3, "0")}` as AskMessage["id"],
      sessionId: s.id,
      role: "user",
      status: "complete",
      content: body.content,
      scope: body.scope ?? s.defaultScope,
      citations: [],
      followUps: [],
      stats: null,
      error: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    };
    messages = [...messages, userMsg];

    // Create the placeholder assistant message that the stream will fill.
    const assistantMsg: AskMessage = {
      id: `am_${String(messages.length + 1).padStart(3, "0")}` as AskMessage["id"],
      sessionId: s.id,
      role: "assistant",
      status: "streaming",
      content: "",
      scope: body.scope ?? s.defaultScope,
      citations: [],
      followUps: [],
      stats: null,
      error: null,
      feedback: null,
      createdAt: now,
      updatedAt: now,
    };
    messages = [...messages, assistantMsg];

    // Build the SSE stream. Frames are deterministic for testability.
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = ["这是一个", "模拟的", "流式回答 [cite:1]。"];
        for (const c of chunks) {
          await new Promise((r) => setTimeout(r, 120));
          controller.enqueue(
            encodeSse({ type: "delta", messageId: assistantMsg.id, text: c }),
          );
        }
        controller.enqueue(
          encodeSse({
            type: "citation",
            messageId: assistantMsg.id,
            citation: {
              kind: "web",
              index: 1,
              title: { zh: "示例引用", en: "Example citation" },
              url: "https://example.com/cite",
              excerpt: { zh: "节选", en: "Excerpt" },
            },
          }),
        );
        controller.enqueue(
          encodeSse({
            type: "followups",
            messageId: assistantMsg.id,
            followUps: [
              { zh: "继续追问?", en: "Follow up?" },
              { zh: "看相关论文?", en: "See related papers?" },
            ],
          }),
        );
        controller.enqueue(
          encodeSse({
            type: "stats",
            messageId: assistantMsg.id,
            stats: {
              startedAt: now,
              finishedAt: new Date().toISOString(),
              ttftMs: 120,
              durationMs: 480,
              inputTokens: 32,
              outputTokens: 18,
              model: "rt-ask-v3-mock",
            },
          }),
        );
        controller.enqueue(encodeSse({ type: "done", messageId: assistantMsg.id }));
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Message-Id": assistantMsg.id,
      },
    });
  }),

  http.post(
    `${API}/ask/sessions/:sid/messages/:mid/regenerate`,
    ({ params }) => {
      const m = messages.find((x) => x.id === params.mid);
      if (!m)
        return HttpResponse.json(err(ErrorCode.NotFound, "Message not found"), {
          status: 404,
        });
      // Stream identical to send-message; for brevity reuse the same content.
      return HttpResponse.json(ok(m), { status: 202 });
    },
  ),

  http.post(
    `${API}/ask/sessions/:sid/messages/:mid/feedback`,
    async ({ params, request }) => {
      const body = (await request.json()) as MessageFeedbackRequest;
      const idx = messages.findIndex((x) => x.id === params.mid);
      if (idx < 0)
        return HttpResponse.json(err(ErrorCode.NotFound, "Message not found"), {
          status: 404,
        });
      const fb: MessageFeedbackResponse = {
        vote: body.vote,
        comment: body.comment ?? null,
      };
      messages[idx] = { ...messages[idx], feedback: fb };
      return HttpResponse.json(ok(fb));
    },
  ),

  http.get(`${API}/ask/suggestions`, () => {
    const payload: ListSuggestionsResponse = { suggestions: SEED_ASK_SUGGESTIONS };
    return HttpResponse.json(ok(payload));
  }),
];
