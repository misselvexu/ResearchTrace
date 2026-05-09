/**
 * Shared mock helpers — envelope wrappers, ID factories, fixture seed.
 *
 * All MSW handlers should compose responses through `ok()` / `err()` to
 * guarantee the ApiResponse<T> envelope is consistently shaped.
 */

import type {
  ApiResponse,
  ErrorCode,
  PageQuery,
  PageResponse,
  RequestId,
} from "@/types/api";

let __reqCounter = 0;

/** Generate a deterministic-ish request ID for a mock response. */
export function nextRequestId(): RequestId {
  __reqCounter += 1;
  const stamp = Date.now().toString(36);
  const seq = __reqCounter.toString(36).padStart(4, "0");
  return `req_mock_${stamp}_${seq}` as RequestId;
}

/** Wrap a payload in the ApiResponse success envelope. */
export function ok<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    message: "OK",
    data,
    requestId: nextRequestId(),
    timestamp: new Date().toISOString(),
  };
}

/** Wrap an error in the ApiResponse failure envelope (data=null). */
export function err(code: ErrorCode, message: string): ApiResponse<null> {
  return {
    code,
    message,
    data: null,
    requestId: nextRequestId(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Cursor-paginate an in-memory array.
 * Encodes the cursor as the next start index (base64) for opacity.
 */
export function paginate<T>(
  items: T[],
  query: PageQuery & { cursor?: string },
): PageResponse<T> {
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
  const start = decodeCursor(query.cursor);
  const slice = items.slice(start, start + limit);
  const nextStart = start + slice.length;
  const hasMore = nextStart < items.length;
  return {
    items: slice,
    nextCursor: hasMore ? encodeCursor(nextStart) : null,
    totalEstimate: items.length,
    size: slice.length,
  };
}

function encodeCursor(n: number): string {
  return Buffer.from(`mc:${n}`).toString("base64url");
}

function decodeCursor(c: string | undefined): number {
  if (!c) return 0;
  try {
    const decoded = Buffer.from(c, "base64url").toString("utf8");
    if (!decoded.startsWith("mc:")) return 0;
    const n = parseInt(decoded.slice(3), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Parse a Request URL's query string into a typed object. */
export function readQuery<T extends object>(req: Request): T {
  const url = new URL(req.url);
  const out: Record<string, string | number | boolean | undefined> = {};
  url.searchParams.forEach((v, k) => {
    if (v === "true") out[k] = true;
    else if (v === "false") out[k] = false;
    else if (/^-?\d+$/.test(v)) out[k] = parseInt(v, 10);
    else out[k] = v;
  });
  return out as T;
}

/** Stable ISO timestamp helpers for deterministic fixtures. */
export const FIXTURE_NOW = "2026-05-09T10:00:00.000Z";

export function isoMinusDays(days: number): string {
  const d = new Date(FIXTURE_NOW);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export function isoMinusHours(hours: number): string {
  const d = new Date(FIXTURE_NOW);
  d.setUTCHours(d.getUTCHours() - hours);
  return d.toISOString();
}
