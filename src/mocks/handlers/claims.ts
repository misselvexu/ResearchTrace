/**
 * MSW handlers — Claims & Evidence domain.
 */

import { http, HttpResponse } from "msw";
import type {
  Claim,
  DisputeClaimRequest,
  DisputeClaimResponse,
  ListClaimsQuery,
  ListEvidenceQuery,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import { SEED_CLAIMS, SEED_EVIDENCE } from "../fixtures/seeds";

const API = "/api/v1";

let claims: Claim[] = [...SEED_CLAIMS];

function applyClaimFilters(list: Claim[], q: ListClaimsQuery): Claim[] {
  let out = [...list];
  if (q.topicId) out = out.filter((c) => c.topicId === q.topicId);
  if (q.strength) out = out.filter((c) => c.strength === q.strength);
  if (q.q) {
    const needle = q.q.toLowerCase();
    out = out.filter(
      (c) =>
        c.statement.zh.toLowerCase().includes(needle) ||
        c.statement.en.toLowerCase().includes(needle),
    );
  }
  const dir = q.direction === "asc" ? 1 : -1;
  switch (q.sort) {
    case "confidence":
      out.sort((a, b) => dir * (b.confidence - a.confidence));
      break;
    case "evidence_count":
      out.sort((a, b) => dir * (b.evidenceCount - a.evidenceCount));
      break;
    case "recent":
    default:
      out.sort((a, b) => dir * b.updatedAt.localeCompare(a.updatedAt));
  }
  return out;
}

export const claimsHandlers = [
  http.get(`${API}/claims`, ({ request }) => {
    const q = readQuery<ListClaimsQuery & { cursor?: string }>(request);
    return HttpResponse.json(ok(paginate(applyClaimFilters(claims, q), q)));
  }),

  http.get(`${API}/claims/:id`, ({ params }) => {
    const c = claims.find((x) => x.id === params.id);
    if (!c)
      return HttpResponse.json(err(ErrorCode.ClaimNotFound, "Claim not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(c));
  }),

  http.get(`${API}/claims/:id/evidence`, ({ params, request }) => {
    const c = claims.find((x) => x.id === params.id);
    if (!c)
      return HttpResponse.json(err(ErrorCode.ClaimNotFound, "Claim not found"), {
        status: 404,
      });
    const q = readQuery<ListEvidenceQuery & { cursor?: string }>(request);
    let list = SEED_EVIDENCE.filter((e) => e.claimId === c.id);
    if (q.stance) list = list.filter((e) => e.stance === q.stance);
    if (q.kind) list = list.filter((e) => e.kind === q.kind);
    return HttpResponse.json(ok(paginate(list, q)));
  }),

  http.post(`${API}/claims/:id/dispute`, async ({ params, request }) => {
    const body = (await request.json()) as DisputeClaimRequest;
    const idx = claims.findIndex((c) => c.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.ClaimNotFound, "Claim not found"), {
        status: 404,
      });
    claims[idx] = {
      ...claims[idx],
      myDispute: { reason: body.reason, createdAt: new Date().toISOString() },
    };
    const payload: DisputeClaimResponse = claims[idx];
    return HttpResponse.json(ok(payload));
  }),

  http.get(`${API}/topics/:topicId/claims`, ({ params, request }) => {
    const q = readQuery<ListClaimsQuery & { cursor?: string }>(request);
    const filtered = claims.filter((c) => c.topicId === params.topicId);
    return HttpResponse.json(ok(paginate(applyClaimFilters(filtered, q), q)));
  }),
];
