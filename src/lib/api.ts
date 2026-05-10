/**
 * Typed fetch client for the ResearchTrace API.
 *
 * Wraps `fetch` to:
 *   1. Build URLs against `NEXT_PUBLIC_API_BASE_URL` (default `/api/v1`).
 *   2. Serialize query params (skipping `undefined` / `null`).
 *   3. JSON-encode bodies with the right `Content-Type`.
 *   4. Unwrap the standard `ApiResponse<T>` envelope and return `T`.
 *   5. Throw `ApiError` (carrying `code`, `message`, `requestId`, `status`)
 *      on non-2xx responses or `code !== ErrorCode.Success`.
 *
 * The same client is used both client-side (where MSW intercepts in dev)
 * and server-side (where MSW's node setup would intercept — only used in
 * tests). In production it talks to the real backend.
 *
 * Usage:
 *   const topics = await api.get<Topic[]>("/topics", { sort: "recent" });
 *   const t = await api.post<Topic, CreateTopicRequest>("/topics", body);
 */

import type { ApiResponse } from "@/types/api";
import { ErrorCode } from "@/types/api";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_BASE = "/api/v1";

function getBase(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (typeof process !== "undefined" ? (process.env as any) : {}) ?? {};
  return env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;
}

// ---------------------------------------------------------------------------
// ApiError — every failure surfaces here
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly requestId: string | null;
  readonly status: number;

  constructor(args: {
    code: ErrorCode;
    message: string;
    requestId?: string | null;
    status?: number;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.code = args.code;
    this.requestId = args.requestId ?? null;
    this.status = args.status ?? 0;
  }

  /** i18n key the UI should look up. */
  get i18nKey(): string {
    return `errors.${this.code}`;
  }
}

// ---------------------------------------------------------------------------
// Query string serializer — drops null/undefined, joins arrays with commas
// ---------------------------------------------------------------------------

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly (string | number | boolean)[];

export type QueryParams = Record<string, QueryValue>;

function serializeQuery(params?: QueryParams): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      usp.set(k, v.join(","));
    } else {
      usp.set(k, String(v));
    }
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------------------
// Core request — used by every verb
// ---------------------------------------------------------------------------

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  /** Extra headers (Authorization etc.). */
  headers?: Record<string, string>;
}

async function request<T>(path: string, opts: RequestOptions): Promise<T> {
  const url = `${getBase()}${path}${serializeQuery(opts.query)}`;
  const init: RequestInit = {
    method: opts.method,
    headers: {
      Accept: "application/json",
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers ?? {}),
    },
    signal: opts.signal,
    credentials: "include",
  };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ApiError({
      code: ErrorCode.ServiceUnavailable,
      message: e instanceof Error ? e.message : "Network error",
      status: 0,
    });
  }

  // 204 No Content
  if (res.status === 204) {
    return null as T;
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new ApiError({
      code: ErrorCode.InternalError,
      message: `Invalid JSON from ${path}`,
      status: res.status,
    });
  }

  // Defensive: make sure payload looks like ApiResponse<T>
  const env = payload as Partial<ApiResponse<T>>;
  if (env == null || typeof env !== "object" || typeof env.code !== "number") {
    throw new ApiError({
      code: ErrorCode.InternalError,
      message: `Malformed envelope from ${path}`,
      status: res.status,
    });
  }

  if (env.code !== ErrorCode.Success) {
    throw new ApiError({
      code: env.code as ErrorCode,
      message: env.message ?? "Unknown error",
      requestId: env.requestId ?? null,
      status: res.status,
    });
  }

  return env.data as T;
}

// ---------------------------------------------------------------------------
// Public verb-shaped surface
// ---------------------------------------------------------------------------

export const api = {
  get<T>(path: string, query?: QueryParams, signal?: AbortSignal): Promise<T> {
    return request<T>(path, { method: "GET", query, signal });
  },
  post<T, B = unknown>(
    path: string,
    body?: B,
    query?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    return request<T>(path, { method: "POST", body, query, signal });
  },
  patch<T, B = unknown>(
    path: string,
    body?: B,
    query?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    return request<T>(path, { method: "PATCH", body, query, signal });
  },
  put<T, B = unknown>(
    path: string,
    body?: B,
    query?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    return request<T>(path, { method: "PUT", body, query, signal });
  },
  delete<T = null>(path: string, query?: QueryParams, signal?: AbortSignal): Promise<T> {
    return request<T>(path, { method: "DELETE", query, signal });
  },
};

// ---------------------------------------------------------------------------
// Type guard for callers that want to pattern-match on errors
// ---------------------------------------------------------------------------

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
