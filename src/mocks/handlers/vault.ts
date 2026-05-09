/**
 * MSW handlers — Vault domain.
 */

import { http, HttpResponse } from "msw";
import type {
  CreateCollectionRequest,
  CreateVaultItemRequest,
  ListTagsResponse,
  ListVaultQuery,
  TagSummary,
  UpdateCollectionRequest,
  UpdateVaultItemRequest,
  VaultCollection,
  VaultExportRequest,
  VaultExportResponse,
  VaultItem,
  VaultItemId,
} from "@/types/api";
import { ErrorCode } from "@/types/api";
import { err, ok, paginate, readQuery } from "../fixtures/_shared";
import { SEED_VAULT_COLLECTIONS, SEED_VAULT_ITEMS } from "../fixtures/seeds";

const API = "/api/v1";

let items: VaultItem[] = [...SEED_VAULT_ITEMS];
let collections: VaultCollection[] = [...SEED_VAULT_COLLECTIONS];

function applyFilters(list: VaultItem[], q: ListVaultQuery): VaultItem[] {
  let out = q.includeTrashed ? [...list] : list.filter((i) => !i.trashed);
  if (q.q) {
    const needle = q.q.toLowerCase();
    out = out.filter(
      (i) =>
        i.title.zh.toLowerCase().includes(needle) ||
        i.title.en.toLowerCase().includes(needle) ||
        i.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }
  if (q.kind) out = out.filter((i) => i.kind === q.kind);
  if (q.tag) out = out.filter((i) => i.tags.includes(q.tag!));
  if (q.collectionId) out = out.filter((i) => i.collectionIds.includes(q.collectionId!));
  if (q.starred !== undefined) out = out.filter((i) => i.starred === q.starred);

  const dir = q.direction === "asc" ? 1 : -1;
  switch (q.sort) {
    case "alphabetical":
      out.sort((a, b) => dir * a.title.en.localeCompare(b.title.en));
      break;
    case "added":
      out.sort((a, b) => dir * b.createdAt.localeCompare(a.createdAt));
      break;
    case "recent":
    case "lastOpened":
    default:
      out.sort((a, b) => dir * b.updatedAt.localeCompare(a.updatedAt));
  }
  return out;
}

export const vaultHandlers = [
  http.get(`${API}/vault`, ({ request }) => {
    const q = readQuery<ListVaultQuery & { cursor?: string }>(request);
    return HttpResponse.json(ok(paginate(applyFilters(items, q), q)));
  }),

  http.post(`${API}/vault`, async ({ request }) => {
    const body = (await request.json()) as CreateVaultItemRequest;
    const id = `v_${String(items.length + 1).padStart(3, "0")}` as VaultItemId;
    const now = new Date().toISOString();
    const base = {
      id,
      ownerId: items[0].ownerId,
      title: body.title,
      note: null,
      tags: body.tags ?? [],
      collectionIds: body.collectionIds ?? [],
      trashed: false,
      trashedAt: null,
      starred: false,
      createdAt: now,
      updatedAt: now,
    };
    let created: VaultItem;
    switch (body.kind) {
      case "paper":
        created = { ...base, kind: "paper", document: body.document, pdfStored: false };
        break;
      case "note":
        created = {
          ...base,
          kind: "note",
          body: body.body,
          wordCount: (body.body.zh + " " + body.body.en).trim().split(/\s+/).length,
        };
        break;
      case "brief":
        created = {
          ...base,
          kind: "brief",
          briefId: body.briefId,
          snapshotAt: now,
        };
        break;
      case "clip":
        created = {
          ...base,
          kind: "clip",
          sourceUrl: body.sourceUrl,
          excerpt: body.excerpt,
          screenshotUrl: body.screenshotUrl ?? null,
        };
        break;
      case "file":
        created = {
          ...base,
          kind: "file",
          filename: body.title.en || body.title.zh,
          mimeType: body.mimeType,
          sizeBytes: body.sizeBytes,
          downloadUrl: `https://cdn.researchtrace.com/files/${body.uploadKey}`,
        };
        break;
    }
    items = [created, ...items];
    return HttpResponse.json(ok(created), { status: 201 });
  }),

  http.get(`${API}/vault/:id`, ({ params }) => {
    const v = items.find((i) => i.id === params.id);
    if (!v)
      return HttpResponse.json(err(ErrorCode.VaultItemNotFound, "Vault item not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(v));
  }),

  http.patch(`${API}/vault/:id`, async ({ params, request }) => {
    const body = (await request.json()) as UpdateVaultItemRequest;
    const idx = items.findIndex((i) => i.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.VaultItemNotFound, "Vault item not found"), {
        status: 404,
      });
    const cur = items[idx];
    const merged = {
      ...cur,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.collectionIds !== undefined && { collectionIds: body.collectionIds }),
      ...(body.note !== undefined && { note: body.note }),
      ...(body.starred !== undefined && { starred: body.starred }),
      updatedAt: new Date().toISOString(),
    } as VaultItem;
    if (cur.kind === "note" && body.body) {
      (merged as { body: typeof body.body }).body = body.body;
    }
    items[idx] = merged;
    return HttpResponse.json(ok(items[idx]));
  }),

  http.delete(`${API}/vault/:id`, ({ params }) => {
    const idx = items.findIndex((i) => i.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.VaultItemNotFound, "Vault item not found"), {
        status: 404,
      });
    items[idx] = { ...items[idx], trashed: true, trashedAt: new Date().toISOString() } as VaultItem;
    return HttpResponse.json(ok(items[idx]));
  }),

  http.post(`${API}/vault/:id/restore`, ({ params }) => {
    const idx = items.findIndex((i) => i.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.VaultItemNotFound, "Vault item not found"), {
        status: 404,
      });
    items[idx] = { ...items[idx], trashed: false, trashedAt: null } as VaultItem;
    return HttpResponse.json(ok(items[idx]));
  }),

  http.get(`${API}/vault/collections`, () => HttpResponse.json(ok({ items: collections }))),

  http.post(`${API}/vault/collections`, async ({ request }) => {
    const body = (await request.json()) as CreateCollectionRequest;
    const now = new Date().toISOString();
    const c: VaultCollection = {
      id: `c_${String(collections.length + 1).padStart(3, "0")}`,
      ownerId: collections[0].ownerId,
      name: body.name,
      description: body.description ?? null,
      itemCount: 0,
      color: body.color ?? null,
      position: collections.length,
      createdAt: now,
      updatedAt: now,
    };
    collections = [...collections, c];
    return HttpResponse.json(ok(c), { status: 201 });
  }),

  http.patch(`${API}/vault/collections/:id`, async ({ params, request }) => {
    const body = (await request.json()) as UpdateCollectionRequest;
    const idx = collections.findIndex((c) => c.id === params.id);
    if (idx < 0)
      return HttpResponse.json(err(ErrorCode.NotFound, "Collection not found"), {
        status: 404,
      });
    collections[idx] = {
      ...collections[idx],
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.position !== undefined && { position: body.position }),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(ok(collections[idx]));
  }),

  http.delete(`${API}/vault/collections/:id`, ({ params }) => {
    const before = collections.length;
    collections = collections.filter((c) => c.id !== params.id);
    if (collections.length === before)
      return HttpResponse.json(err(ErrorCode.NotFound, "Collection not found"), {
        status: 404,
      });
    return HttpResponse.json(ok(null));
  }),

  http.get(`${API}/vault/tags`, () => {
    const tagMap = new Map<string, TagSummary>();
    for (const i of items) {
      if (i.trashed) continue;
      for (const t of i.tags) {
        const cur = tagMap.get(t);
        if (cur) {
          cur.count += 1;
          if (i.updatedAt > cur.lastUsedAt) cur.lastUsedAt = i.updatedAt;
        } else {
          tagMap.set(t, { tag: t, count: 1, lastUsedAt: i.updatedAt });
        }
      }
    }
    const payload: ListTagsResponse = {
      tags: Array.from(tagMap.values()).sort((a, b) => b.count - a.count),
    };
    return HttpResponse.json(ok(payload));
  }),

  http.post(`${API}/vault/export`, async ({ request }) => {
    await (request.json() as Promise<VaultExportRequest>);
    const payload: VaultExportResponse = {
      jobId: `job_${Date.now().toString(36)}`,
      statusUrl: "/api/v1/vault/export/status",
    };
    return HttpResponse.json(ok(payload));
  }),
];
