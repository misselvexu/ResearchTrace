/**
 * Ask page — live overlay.
 *
 * Two responsibilities:
 *
 *   1. `useAskOverlay()` — fetch session list + UI suggestion chips so the
 *      sidebar history + suggestion pills can be data-driven instead of
 *      pure-i18n. Editorial keys remain the fallback when the API has
 *      nothing to say.
 *
 *   2. `streamAskAnswer()` — POST /ask/sessions/:id/messages and parse the
 *      Server-Sent Events stream into delta / citation / followups / stats
 *      / done / error frames. Emits to a callback so the page can append
 *      tokens, citations, and finalize state.
 *
 *      Note: the typed `api.post` wrapper assumes JSON. SSE returns
 *      `text/event-stream`, so we go through `fetch` directly here. We
 *      still respect ApiResponse-style failures by mapping non-2xx into
 *      ApiError via handleApiError on the caller.
 */

"use client";

import { useEffect, useState } from "react";
import type {
  AskCitation,
  AskMessageStats,
  AskSession,
  AskStreamEvent,
  AskSuggestion,
  CreateSessionRequest,
  LocalizedText,
} from "@/types/api";
import { api, ApiError } from "@/lib/api";
import { askSessionsQuery, askSuggestionsQuery, invalidate } from "@/lib/queries";

const API_BASE =
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : "") ||
  "/api/v1";

// ---------------------------------------------------------------------------
// Sidebar overlay — sessions + suggestions
// ---------------------------------------------------------------------------

export interface AskOverlay {
  sessions: AskSession[];
  suggestions: AskSuggestion[];
  loading: boolean;
}

export function useAskOverlay(): AskOverlay {
  const [state, setState] = useState<AskOverlay>({
    sessions: [],
    suggestions: [],
    loading: true,
  });
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      askSessionsQuery({ sort: "recent", limit: 8 }),
      askSuggestionsQuery(),
    ]).then(([sessR, sugR]) => {
      if (cancelled) return;
      setState({
        sessions: sessR.status === "fulfilled" ? sessR.value.items : [],
        suggestions: sugR.status === "fulfilled" ? sugR.value.suggestions : [],
        loading: false,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

/** Pick the locale-appropriate side of LocalizedText with a safe fallback. */
export function pickLocale(text: LocalizedText, locale: string): string {
  const primary = locale === "en" ? text.en : text.zh;
  return primary || text.en || text.zh || "";
}

/** "2h" / "3d" / "Just now" — same shape as topic.relativeTime. */
export function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const ms = Math.max(0, now - then);
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  return `${d}d`;
}

// ---------------------------------------------------------------------------
// SSE streaming
// ---------------------------------------------------------------------------

export interface AskStreamHandlers {
  onDelta?: (text: string, messageId: string) => void;
  onCitation?: (cite: AskCitation, messageId: string) => void;
  onFollowups?: (fu: LocalizedText[], messageId: string) => void;
  onStats?: (stats: AskMessageStats, messageId: string) => void;
  onDone?: (messageId: string) => void;
  onError?: (err: LocalizedText | string, messageId: string | null) => void;
}

/**
 * Send a user message and stream the assistant's reply.
 *
 * Returns the (eventually closed) Promise so callers can `await` completion
 * if they wish, but most callers will rely on the per-frame callbacks.
 */
export async function streamAskAnswer(
  sessionId: string,
  prompt: string,
  handlers: AskStreamHandlers,
): Promise<void> {
  const url = `${API_BASE}/ask/sessions/${sessionId}/messages`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      credentials: "include",
      body: JSON.stringify({ content: prompt }),
    });
  } catch (e) {
    handlers.onError?.(
      e instanceof Error ? e.message : "Network error",
      null,
    );
    return;
  }

  if (!res.ok || !res.body) {
    handlers.onError?.(
      `HTTP ${res.status}`,
      res.headers.get("X-Message-Id"),
    );
    return;
  }

  const messageId = res.headers.get("X-Message-Id");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // Each SSE frame ends with "\n\n". Frames begin with "data: ".
  // We accumulate bytes, split on the frame terminator, and dispatch.
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let split: number;
    while ((split = buffer.indexOf("\n\n")) >= 0) {
      const raw = buffer.slice(0, split).trim();
      buffer = buffer.slice(split + 2);
      if (!raw.startsWith("data:")) continue;
      const json = raw.slice(5).trim();
      if (!json) continue;
      let evt: AskStreamEvent;
      try {
        evt = JSON.parse(json) as AskStreamEvent;
      } catch {
        continue;
      }
      switch (evt.type) {
        case "delta":
          handlers.onDelta?.(evt.text, evt.messageId);
          break;
        case "citation":
          handlers.onCitation?.(evt.citation, evt.messageId);
          break;
        case "followups":
          handlers.onFollowups?.(evt.followUps, evt.messageId);
          break;
        case "stats":
          handlers.onStats?.(evt.stats, evt.messageId);
          break;
        case "error":
          handlers.onError?.(evt.error, evt.messageId);
          break;
        case "done":
          handlers.onDone?.(evt.messageId);
          break;
      }
    }
  }

  // Streams without an explicit `done` frame still need a terminal callback.
  if (messageId) handlers.onDone?.(messageId);
}

/**
 * Ensure we have an Ask session to write into. If `sessionId` is provided,
 * use it; otherwise create a fresh session and return its id.
 */
export async function ensureAskSession(
  prompt: string,
  existing?: string,
): Promise<string> {
  if (existing) return existing;
  const body: CreateSessionRequest = {
    title: { zh: prompt.slice(0, 40), en: prompt.slice(0, 40) },
  };
  const created = await api.post<AskSession, CreateSessionRequest>(
    "/ask/sessions",
    body,
  );
  // New session means the sidebar list is stale.
  invalidate(["ask.sessions"]);
  return created.id;
}

/** Re-export ApiError so consumers don't need a second import line. */
export { ApiError };
