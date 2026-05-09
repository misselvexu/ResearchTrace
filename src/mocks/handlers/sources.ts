/**
 * MSW handlers — Sources domain.
 */

import { http, HttpResponse } from "msw";
import type {
  CatalogResponse,
  CreateSourceRequest,
  ListSourcesQuery,
  Source,
  SourceHealth,
  SourceId,
  SyncSourceResponse,
  TestSourceResponse,
  UpdateSourceRequest,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import { SEED_SOURCES } from "../fixtures/seeds";

const API = "/api/v1";

let sources: Source[] = [...SEED_SOURCES];

const CATALOG: CatalogResponse = {
  entries: [
    {
      kind: "arxiv",
      name: { zh: "arXiv", en: "arXiv" },
      description: { zh: "学术预印本仓库", en: "Open-access preprint archive" },
      iconUrl: "/icons/arxiv.svg",
      requiresOAuth: false,
      beta: false,
      docsUrl: "https://arxiv.org/help/api",
    },
    {
      kind: "rss",
      name: { zh: "RSS 订阅", en: "RSS Feed" },
      description: { zh: "通用 RSS/Atom 订阅源", en: "Generic RSS/Atom feed" },
      iconUrl: "/icons/rss.svg",
      requiresOAuth: false,
      beta: false,
      docsUrl: "https://www.rssboard.org/rss-specification",
    },
    {
      kind: "github",
      name: { zh: "GitHub", en: "GitHub" },
      description: { zh: "仓库发布、议题、讨论", en: "Releases, issues, discussions" },
      iconUrl: "/icons/github.svg",
      requiresOAuth: true,
      beta: false,
      docsUrl: "https://docs.github.com/en/rest",
    },
    {
      kind: "openreview",
      name: { zh: "OpenReview", en: "OpenReview" },
      description: { zh: "学术会议公开评审", en: "Open peer review for conferences" },
      iconUrl: "/icons/openreview.svg",
      requiresOAuth: false,
      beta: false,
      docsUrl: "https://docs.openreview.net/",
    },
    {
      kind: "hackernews",
      name: { zh: "Hacker News", en: "Hacker News" },
      description: { zh: "技术社区讨论", en: "Tech community discussions" },
      iconUrl: "/icons/hn.svg",
      requiresOAuth: false,
      beta: false,
      docsUrl: "https://github.com/HackerNews/API",
    },
  ],
};

export const sourcesHandlers = [
  http.get(`${API}/sources`, ({ request }) => {
    const q = readQuery<ListSourcesQuery & { cursor?: string }>(request);
    let filtered = [...sources];
    if (q.q) {
      const needle = q.q.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.zh.toLowerCase().includes(needle) ||
          s.name.en.toLowerCase().includes(needle),
      );
    }
    if (q.kind) filtered = filtered.filter((s) => s.kind === q.kind);
    if (q.status) filtered = filtered.filter((s) => s.status === q.status);
    if (q.enabled !== undefined) filtered = filtered.filter((s) => s.enabled === q.enabled);
    return HttpResponse.json(ok(paginate(filtered, q)));
  }),

  http.post(`${API}/sources`, async ({ request }) => {
    const body = (await request.json()) as CreateSourceRequest;
    const id = `s_${String(sources.length + 1).padStart(3, "0")}` as SourceId;
    const now = new Date().toISOString();
    const created: Source = {
      id,
      ownerId: sources[0].ownerId,
      kind: body.kind,
      name: body.name,
      config: body.config,
      status: "connected",
      lastSyncedAt: null,
      recentItemCount: 0,
      lastError: null,
      enabled: body.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    };
    sources = [created, ...sources];
    return HttpResponse.json(ok(created), { status: 201 });
  }),

  http.get(`${API}/sources/:id`, ({ params }) => {
    const s = sources.find((x) => x.id === params.id);
    if (!s)
      return HttpResponse.json(err(ErrorCode.SourceNotFound, "Source not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(s));
  }),

  http.patch(`${API}/sources/:id`, async ({ params, request }) => {
    const body = (await request.json()) as UpdateSourceRequest;
    const idx = sources.findIndex((s) => s.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.SourceNotFound, "Source not found"), {
        status: 404,
      });
    sources[idx] = {
      ...sources[idx],
      ...(body.name !== undefined && { name: body.name }),
      ...(body.config !== undefined && { config: body.config }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(ok(sources[idx]));
  }),

  http.delete(`${API}/sources/:id`, ({ params }) => {
    const before = sources.length;
    sources = sources.filter((s) => s.id !== params.id);
    if (sources.length === before)
      return HttpResponse.json(err(ErrorCode.SourceNotFound, "Source not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(null));
  }),

  http.post(`${API}/sources/:id/test`, ({ params }) => {
    const s = sources.find((x) => x.id === params.id);
    if (!s)
      return HttpResponse.json(err(ErrorCode.SourceNotFound, "Source not found"), {
        status: 404,
      });
    const payload: TestSourceResponse = {
      ok: true,
      latencyMs: 412,
      sampleCount: 24,
      error: null,
    };
    return HttpResponse.json(ok(payload));
  }),

  http.post(`${API}/sources/:id/sync`, ({ params }) => {
    const s = sources.find((x) => x.id === params.id);
    if (!s)
      return HttpResponse.json(err(ErrorCode.SourceNotFound, "Source not found"), {
        status: 404,
      });
    const payload: SyncSourceResponse = {
      jobId: `job_${Date.now().toString(36)}`,
      startedAt: new Date().toISOString(),
    };
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/sources/:id/health`, ({ params }) => {
    const s = sources.find((x) => x.id === params.id);
    if (!s)
      return HttpResponse.json(err(ErrorCode.SourceNotFound, "Source not found"), {
        status: 404,
      });
    const payload: SourceHealth = {
      sourceId: s.id,
      status: s.status,
      lastSyncedAt: s.lastSyncedAt,
      lastSyncDurationMs: 3200,
      lastSyncCount: 12,
      recentErrors: s.lastError
        ? [{ at: new Date().toISOString(), message: s.lastError }]
        : [],
    };
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/sources/catalog`, () => HttpResponse.json(ok(CATALOG))),
];
