/**
 * MSW handlers — Agents domain.
 */

import { http, HttpResponse } from "msw";
import type {
  Agent,
  AgentRun,
  CreateAgentRequest,
  ListAgentRunsQuery,
  ListAgentsQuery,
  ListTemplatesResponse,
  RunAgentResponse,
  UpdateAgentRequest,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import {
  SEED_AGENT_RUNS,
  SEED_AGENT_TEMPLATES,
  SEED_AGENTS,
} from "../fixtures/seeds";

const API = "/api/v1";

let agents: Agent[] = [...SEED_AGENTS];
let runs: AgentRun[] = [...SEED_AGENT_RUNS];

function applyFilters(list: Agent[], q: ListAgentsQuery): Agent[] {
  let out = [...list];
  if (q.kind) out = out.filter((a) => a.kind === q.kind);
  if (q.status) out = out.filter((a) => a.status === q.status);
  if (q.q) {
    const needle = q.q.toLowerCase();
    out = out.filter(
      (a) =>
        a.name.zh.toLowerCase().includes(needle) ||
        a.name.en.toLowerCase().includes(needle),
    );
  }
  const dir = q.direction === "asc" ? 1 : -1;
  switch (q.sort) {
    case "alphabetical":
      out.sort((a, b) => dir * a.name.en.localeCompare(b.name.en));
      break;
    case "lastRun":
      out.sort(
        (a, b) =>
          dir * ((b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "")),
      );
      break;
    case "recent":
    default:
      out.sort((a, b) => dir * b.updatedAt.localeCompare(a.updatedAt));
  }
  return out;
}

export const agentsHandlers = [
  http.get(`${API}/agents`, ({ request }) => {
    const q = readQuery<ListAgentsQuery & { cursor?: string }>(request);
    return HttpResponse.json(ok(paginate(applyFilters(agents, q), q)));
  }),

  http.post(`${API}/agents`, async ({ request }) => {
    const body = (await request.json()) as CreateAgentRequest;
    const now = new Date().toISOString();
    const created: Agent = {
      id: `ag_${String(agents.length + 1).padStart(3, "0")}` as Agent["id"],
      ownerId: agents[0].ownerId,
      kind: body.kind,
      name: body.name,
      description: body.description ?? null,
      status: body.enabled === false ? "disabled" : "enabled",
      trigger: body.trigger,
      config: body.config,
      lastRunAt: null,
      lastRunStatus: null,
      runCount: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };
    agents = [created, ...agents];
    return HttpResponse.json(ok(created), { status: 201 });
  }),

  http.get(`${API}/agents/:id`, ({ params }) => {
    const a = agents.find((x) => x.id === params.id);
    if (!a)
      return HttpResponse.json(err(ErrorCode.AgentNotFound, "Agent not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(a));
  }),

  http.patch(`${API}/agents/:id`, async ({ params, request }) => {
    const body = (await request.json()) as UpdateAgentRequest;
    const idx = agents.findIndex((a) => a.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.AgentNotFound, "Agent not found"), {
        status: 404,
      });
    agents[idx] = {
      ...agents[idx],
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.trigger !== undefined && { trigger: body.trigger }),
      ...(body.config !== undefined && { config: body.config }),
      ...(body.status !== undefined && { status: body.status }),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(ok(agents[idx]));
  }),

  http.delete(`${API}/agents/:id`, ({ params }) => {
    const before = agents.length;
    agents = agents.filter((a) => a.id !== params.id);
    if (agents.length === before)
      return HttpResponse.json(err(ErrorCode.AgentNotFound, "Agent not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(null));
  }),

  http.post(`${API}/agents/:id/run`, ({ params }) => {
    const a = agents.find((x) => x.id === params.id);
    if (!a)
      return HttpResponse.json(err(ErrorCode.AgentNotFound, "Agent not found"), {
        status: 404,
      });
    const runId = `ar_${String(runs.length + 1).padStart(3, "0")}` as AgentRun["id"];
    const startedAt = new Date().toISOString();
    runs = [
      {
        id: runId,
        agentId: a.id,
        status: "queued",
        startedAt,
        finishedAt: null,
        durationMs: null,
        triggerReason: "manual",
        steps: [],
        summary: null,
        error: null,
        outputs: [],
      },
      ...runs,
    ];
    const payload: RunAgentResponse = { runId, startedAt };
    return HttpResponse.json(ok(payload), { status: 202 });
  }),

  http.get(`${API}/agents/:id/runs`, ({ params, request }) => {
    const a = agents.find((x) => x.id === params.id);
    if (!a)
      return HttpResponse.json(err(ErrorCode.AgentNotFound, "Agent not found"), {
        status: 404,
      });
    const q = readQuery<ListAgentRunsQuery & { cursor?: string }>(request);
    let list = runs.filter((r) => r.agentId === a.id);
    if (q.status) list = list.filter((r) => r.status === q.status);
    if (q.since) list = list.filter((r) => r.startedAt >= q.since!);
    list.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    return HttpResponse.json(ok(paginate(list, q)));
  }),

  http.get(`${API}/agents/runs/:runId`, ({ params }) => {
    const r = runs.find((x) => x.id === params.runId);
    if (!r)
      return HttpResponse.json(err(ErrorCode.NotFound, "Run not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(r));
  }),

  http.post(`${API}/agents/runs/:runId/cancel`, ({ params }) => {
    const idx = runs.findIndex((x) => x.id === params.runId);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.NotFound, "Run not found"), {
        status: 404,
      });
    runs[idx] = {
      ...runs[idx],
      status: "canceled",
      finishedAt: new Date().toISOString(),
    };
    return HttpResponse.json(ok(runs[idx]));
  }),

  http.get(`${API}/agents/templates`, () => {
    const payload: ListTemplatesResponse = { templates: SEED_AGENT_TEMPLATES };
    return HttpResponse.json(ok(payload));
  }),
];
