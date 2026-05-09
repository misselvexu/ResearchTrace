# ResearchTrace — API Contract

**Version**: 1.0.0 · **Status**: Draft for backend handoff · **Last updated**: 2026-05-09

This document is the single source of truth for the **frontend ↔ backend contract** of ResearchTrace. The frontend has reverse-engineered this contract from the v0.3 prototype; the backend MUST implement endpoints conforming to this spec.

---

## 1. Architecture overview

```
┌──────────────┐     HTTPS / JSON     ┌──────────────────┐
│  Next.js 16  │ ───────────────────► │   Backend API    │
│  (frontend)  │ ◄─────────────────── │  (lang-agnostic) │
└──────────────┘   ApiResponse<T>     └──────────────────┘
       │                                       │
       │                                       │
   localStorage                            PostgreSQL
   rt-lang, rt-theme                       Redis (cache, queue)
                                           Object storage (PDFs, exports)
```

- **Stack-neutral**: Backend may be Java/Spring, Go, Node/NestJS, or Python/FastAPI. The OpenAPI 3.1 spec at `openapi/researchtrace.yaml` is the authoritative wire contract.
- **TypeScript types**: `src/types/api/` mirrors the OpenAPI spec for compile-time safety on the frontend. Use codegen (e.g. `oapi-codegen`, `openapi-generator`) to mirror these on the backend.
- **Mock layer**: `src/mocks/` (MSW) intercepts every endpoint defined here so the frontend can run end-to-end without a real backend during dev.

---

## 2. Conventions

### 2.1 Base URL

| Environment | Base URL |
|---|---|
| Production | `https://api.researchtrace.com/api/v1` |
| Staging | `https://staging-api.researchtrace.com/api/v1` |
| Local dev | `http://localhost:8080/api/v1` (or MSW intercept) |

Frontend reads `process.env.NEXT_PUBLIC_API_BASE_URL`; in MSW mode it's a no-op (any path under `/api/v1/*` is intercepted).

### 2.2 Content type

All requests/responses use `application/json; charset=utf-8` unless noted (file uploads use `multipart/form-data`; SSE streams use `text/event-stream`).

### 2.3 Response envelope

Every endpoint wraps its payload in `ApiResponse<T>`:

```ts
{
  code: number;          // 0 = success; see ErrorCode
  message: string;       // English; client localizes via `code`
  data: T | null;        // Actual payload; null on error
  requestId: string;     // For tracing/support
  timestamp: string;     // ISO 8601 UTC
}
```

**Why an envelope?** It decouples HTTP transport status from business semantics, gives every response a `requestId` for support tickets, and lets us evolve error handling without breaking clients.

### 2.4 Pagination

Cursor-based, opaque tokens:

```
GET /api/v1/topics?cursor=<opaque>&limit=20

→ {
  items: T[],
  nextCursor: string | null,   // null = last page
  totalEstimate: number,        // approximate, may be stale
  size: number                  // actual returned
}
```

- `limit` default 20, max 100.
- Cursors are opaque — clients MUST NOT decode them. Backend may rotate cursor encoding without breaking clients.

### 2.5 Bilingual text (`LocalizedText`)

Every user-visible string field is bilingual:

```ts
{ zh: "今日", en: "Today" }
```

Storage suggestion: JSONB column `field_i18n jsonb` or two columns `field_zh text, field_en text`. Empty string is allowed; both empty means "no translation".

### 2.6 Timestamps

All timestamps are **ISO 8601 UTC strings** (`2026-05-09T10:00:00.000Z`). Backend serializes Java `Instant` / Go `time.Time` / Python `datetime` accordingly.

### 2.7 IDs

All IDs are opaque strings (typically `<prefix>_<base32>`). Frontend wraps them in branded types (`TopicId`, `UserId`, etc.) for compile-time safety; backend treats them as natural strings.

| Prefix | Domain |
|---|---|
| `u_` | User |
| `t_` | Topic |
| `s_` | Source |
| `i_` | InboxItem |
| `v_` | VaultItem |
| `b_` | Brief |
| `cl_` | Claim |
| `ev_` | Evidence |
| `as_` | AskSession |
| `am_` | AskMessage |
| `ag_` | Agent |
| `ar_` | AgentRun |
| `n_` | Notification |
| `sub_` | Subscription |
| `inv_` | Invoice |
| `pm_` | PaymentMethod |

---

## 3. Authentication

### 3.1 Mechanism

- **Access Token**: short-lived JWT (15 min), passed as `Authorization: Bearer <token>` on every authenticated request.
- **Refresh Token**: long-lived (30 d), delivered ONLY via HttpOnly Secure SameSite=Lax cookie named `rt-refresh`. The client never directly reads or sends it; the browser includes it automatically on `/auth/refresh`.

### 3.2 Flow

```
┌─ Login / Signup / OAuth callback ─────────────────────┐
│                                                       │
│  POST /auth/login { email, password }                 │
│  → 200 { accessToken, expiresIn=900, tokenType }      │
│    + Set-Cookie: rt-refresh=...; HttpOnly; SameSite=Lax
│                                                       │
└───────────────────────────────────────────────────────┘
                       │
                       ▼
┌─ Authenticated request ───────────────────────────────┐
│                                                       │
│  GET /api/v1/topics                                   │
│  Authorization: Bearer <accessToken>                  │
│                                                       │
│  ── on 401 (token expired) ──►  POST /auth/refresh    │
│                                  → new accessToken    │
│                                  → retry original     │
└───────────────────────────────────────────────────────┘
```

### 3.3 OAuth 2.0 (Google / GitHub)

Three-step flow with a "handoff token" to keep the access token out of URL fragments:

1. `GET /auth/oauth/{provider}` → 302 redirect to provider with PKCE state.
2. Provider redirects back to `/auth/oauth/{provider}/callback?code=...`. Backend exchanges code, sets `rt-refresh` cookie, redirects browser to `/auth/oauth/return?handoff=<token>`.
3. Frontend on `/auth/oauth/return` calls `POST /auth/oauth/exchange { handoff }` → returns `AuthTokens`.

### 3.4 Logout

`POST /auth/logout` clears the cookie and (with `everywhere: true`) revokes ALL refresh tokens for the user.

---

## 4. Error model

### 4.1 Error code numbering

| Range | Domain |
|---|---|
| `0` | Success |
| `10000–10999` | Auth & User |
| `11000–11999` | Topics & Sources |
| `12000–12999` | Inbox & Vault |
| `13000–13999` | Briefs & Claims |
| `14000–14999` | Ask & Agents |
| `15000–15999` | Notifications |
| `16000–16999` | Billing |
| `90000–90999` | Generic / infrastructure |

The complete enum lives in `src/types/api/_shared.ts → enum ErrorCode` and `openapi/researchtrace.yaml#/components/schemas/ErrorCode`.

### 4.2 HTTP status alignment

| Business situation | HTTP | `code` |
|---|---|---|
| Success | `200` / `201` / `202` / `204` | `0` |
| Validation error | `400` | `90001` |
| Missing/invalid token | `401` | `10002` / `10003` |
| Forbidden | `403` | `90403` |
| Not found | `404` | `<domain>_NOT_FOUND` |
| Conflict (e.g. dup email) | `409` | `10006` etc. |
| Rate limit | `429` | `90429` (with `Retry-After` header) |
| Server error | `500` | `90500` |
| Maintenance | `503` | `90503` |

### 4.3 Frontend error rendering

The client maps every non-zero `code` to an i18n key `errors.<code>` (e.g. `errors.10001` → "邮箱或密码不正确 / Incorrect email or password"). Always show the localized message; `message` is a fallback only.

---

## 5. The 12 domains

Detailed per-domain reference. For full TypeScript types see `src/types/api/<domain>.ts`; for full endpoint specs see `openapi/researchtrace.yaml`.

### 5.1 Auth (`/auth/*`)

Public endpoints (no `Authorization` header). Sets/consumes `rt-refresh` cookie.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Create account; may auto-login or require email verification |
| POST | `/auth/login` | Email+password login |
| POST | `/auth/refresh` | Exchange refresh cookie for new access token |
| POST | `/auth/logout` | Revoke refresh + clear cookie |
| POST | `/auth/verify-email` | Confirm email via token |
| POST | `/auth/forgot-password` | Send reset email (always 200 to prevent enum) |
| POST | `/auth/reset-password` | Set new password via reset token |
| GET | `/auth/oauth/{provider}` | Redirect to OAuth provider |
| GET | `/auth/oauth/{provider}/callback` | OAuth callback (server) |
| POST | `/auth/oauth/exchange` | Claim handoff token → AuthTokens |

### 5.2 User (`/user/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/user/me` | Current user profile |
| PATCH | `/user/me` | Update displayName/bio |
| GET | `/user/me/preferences` | Read preferences (theme, locale, …) |
| PUT | `/user/me/preferences` | Replace preferences (idempotent) |
| GET | `/user/me/plan` | Plan & quota snapshot |
| POST | `/user/me/avatar` | Upload avatar (multipart) |
| POST | `/user/me/change-password` | Change password (requires old) |
| DELETE | `/user/me` | Schedule account deletion (30-day soft delete) |

### 5.3 Billing (`/billing/*`)

Stripe under the hood; primitives hidden behind this contract.

| Method | Path | Description |
|---|---|---|
| GET | `/billing/plans` | Public plan catalog |
| GET | `/billing/subscription` | Current user's active subscription |
| POST | `/billing/subscription` | Create — returns `checkout` / `confirm` / `active` |
| POST | `/billing/subscription/cancel` | Cancel at period end |
| POST | `/billing/subscription/resume` | Un-cancel before period end |
| POST | `/billing/subscription/change-plan` | Upgrade/downgrade with proration |
| GET | `/billing/invoices` | Paginated history |
| GET | `/billing/invoices/{id}` | Invoice detail |
| GET | `/billing/invoices/{id}/pdf` | Signed PDF URL (5-min TTL) |
| GET | `/billing/payment-methods` | List saved methods |
| POST | `/billing/payment-methods` | Returns Stripe `SetupIntent` clientSecret |
| DELETE | `/billing/payment-methods/{id}` | Remove |

### 5.4 Topics (`/topics/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/topics` | List (filter: q, status, pinned, color; sort: recent/alphabetical/activity/heat) |
| POST | `/topics` | Create |
| GET | `/topics/{id}` | Detail |
| PATCH | `/topics/{id}` | Update (name, keywords, sources, color, status, muted) |
| DELETE | `/topics/{id}` | Delete |
| POST | `/topics/{id}/pin` | Pin to sidebar |
| POST | `/topics/{id}/unpin` | Unpin |
| GET | `/topics/{id}/feed` | Feed items (tab: all/papers/discussions/datasets) |
| GET | `/topics/{id}/stats` | Heat sparkline + top sources/keywords |
| GET | `/topics/{topicId}/claims` | Claims belonging to this topic |

### 5.5 Sources (`/sources/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/sources` | List user's connected sources |
| POST | `/sources` | Connect new source |
| GET | `/sources/{id}` | Detail |
| PATCH | `/sources/{id}` | Update config / enabled |
| DELETE | `/sources/{id}` | Disconnect |
| POST | `/sources/{id}/test` | Probe connectivity |
| POST | `/sources/{id}/sync` | Force re-ingest (returns `jobId`) |
| GET | `/sources/{id}/health` | Last sync status + recent errors |
| GET | `/sources/catalog` | Available connectors directory |

### 5.6 Vault (`/vault/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/vault` | List (filters: q, kind, tag, collectionId, starred, includeTrashed) |
| POST | `/vault` | Save item (kind: paper/note/brief/clip/file) |
| GET | `/vault/{id}` | Item detail |
| PATCH | `/vault/{id}` | Rename, retag, restar, edit note |
| DELETE | `/vault/{id}` | Soft delete (move to trash) |
| POST | `/vault/{id}/restore` | Un-trash |
| GET | `/vault/collections` | List folders |
| POST | `/vault/collections` | Create folder |
| PATCH | `/vault/collections/{id}` | Rename / recolor / reorder |
| DELETE | `/vault/collections/{id}` | Delete folder (items survive) |
| GET | `/vault/tags` | Tag directory with counts |
| POST | `/vault/export` | Async export (returns `jobId`) |

### 5.7 Inbox (`/inbox/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/inbox` | List (filter: all/unread/starred/dismissed; sort: recent/oldest/topic/source) |
| GET | `/inbox/{id}` | Item detail |
| POST | `/inbox/{id}/read` / `/unread` | Toggle read |
| POST | `/inbox/{id}/star` / `/unstar` | Toggle star |
| POST | `/inbox/{id}/dismiss` | Archive |
| POST | `/inbox/{id}/save` | Forward to Vault |
| POST | `/inbox/bulk` | Batch action |
| GET | `/inbox/counters` | Sidebar badge counts |

### 5.8 Notifications (`/notifications/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | List |
| GET | `/notifications/{id}` | Detail |
| POST | `/notifications/{id}/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |
| DELETE | `/notifications/{id}` | Dismiss |
| GET | `/notifications/unread-count` | Bell badge |
| GET | `/notifications/preferences` | Per-kind × per-channel switches |
| PUT | `/notifications/preferences` | Update preferences |

### 5.9 Briefs (`/briefs/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/briefs` | List (filter: topicId, status, cadence, q, since) |
| POST | `/briefs` | Manually request generation (returns 202) |
| GET | `/briefs/{id}` | Detail with sections + claims |
| POST | `/briefs/{id}/regenerate` | Re-run with same params |
| POST | `/briefs/{id}/save` | Forward to Vault |
| POST | `/briefs/{id}/share` | Generate public share URL |
| POST | `/briefs/{id}/feedback` | Up/down vote + comment |
| GET | `/briefs/{id}/export?format=markdown\|pdf\|html` | Signed export URL |

### 5.10 Claims (`/claims/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/claims` | List (filter: topicId, strength, q) |
| GET | `/claims/{id}` | Claim detail |
| GET | `/claims/{id}/evidence` | Evidence supporting/refuting |
| POST | `/claims/{id}/dispute` | User flags claim as wrong |

### 5.11 Ask (`/ask/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/ask/sessions` | List user's chat sessions |
| POST | `/ask/sessions` | Create |
| GET | `/ask/sessions/{id}` | Detail |
| PATCH | `/ask/sessions/{id}` | Rename / archive / pin |
| DELETE | `/ask/sessions/{id}` | Delete |
| GET | `/ask/sessions/{id}/messages` | Paginated, oldest-first |
| POST | `/ask/sessions/{id}/messages` | **Streams reply via SSE** |
| POST | `/ask/sessions/{sid}/messages/{mid}/regenerate` | Re-run |
| POST | `/ask/sessions/{sid}/messages/{mid}/feedback` | Vote + comment |
| GET | `/ask/suggestions` | Prompt chips for Ask page |

**SSE frame schema** (frontend type: `AskStreamEvent`):

```
data: {"type":"delta","messageId":"am_042","text":"...partial..."}\n\n
data: {"type":"citation","messageId":"am_042","citation":{...}}\n\n
data: {"type":"followups","messageId":"am_042","followUps":[...]}\n\n
data: {"type":"stats","messageId":"am_042","stats":{...}}\n\n
data: {"type":"done","messageId":"am_042"}\n\n
```

On error, a single `{"type":"error",...}` frame replaces `done`.

### 5.12 Agents (`/agents/*`)

| Method | Path | Description |
|---|---|---|
| GET | `/agents` | List |
| POST | `/agents` | Create |
| GET | `/agents/{id}` | Detail |
| PATCH | `/agents/{id}` | Update |
| DELETE | `/agents/{id}` | Remove |
| POST | `/agents/{id}/run` | Trigger now (returns `runId`) |
| GET | `/agents/{id}/runs` | Run history |
| GET | `/agents/runs/{runId}` | Run detail with step log |
| POST | `/agents/runs/{runId}/cancel` | Cancel queued/running run |
| GET | `/agents/templates` | Pre-built agent gallery |

---

## 6. Cross-cutting concerns

### 6.1 Idempotency

Mutations that may be retried (POST creates, payment intents) accept an `Idempotency-Key` header. Backend stores result for 24h keyed by `(userId, idempotencyKey)` and returns the cached response on retry.

### 6.2 Rate limiting

Per-user limits enforced server-side; 429 responses include `Retry-After: <seconds>`. Limits are documented in the plan tier (`UserPlan.quotas`).

### 6.3 Optimistic locking

Long-lived editable entities (Topic, Source, Agent, VaultItem) accept an optional `If-Match: "<updatedAt>"` header. Backend returns `409 Conflict` if the entity has been modified since.

### 6.4 Deletion semantics

| Domain | Delete semantics |
|---|---|
| User account | Soft delete with 30-day grace; user can cancel |
| Topic | Hard delete (cascades to feed cache; saved items in Vault unaffected) |
| Source | Hard delete (ingest stops; existing items remain) |
| VaultItem | Soft delete (trash, 30-day auto-purge) |
| Brief / AskSession / Notification | Hard delete |
| Subscription | Soft cancel (`cancelAtPeriodEnd=true`) until period ends |

### 6.5 Localization

Backend MUST persist both `zh` and `en` for any `LocalizedText` field. When a user submits in only one language, backend either:
- (preferred) calls translation service and stores both, OR
- stores submitted side and leaves the other empty (frontend falls back).

Indicate the strategy via `Content-Language` response header.

### 6.6 Audit & telemetry

Every mutation emits an audit event to the audit log. `requestId` from the response envelope correlates frontend logs ↔ backend logs ↔ audit events.

---

## 7. Versioning

- **URL versioning**: `/api/v1/*`. Breaking changes ship as `/api/v2/*`.
- **Additive changes** (new optional fields, new endpoints, new enum values that the spec marks as extensible) do NOT bump the version.
- **Deprecation**: deprecated endpoints respond with `Deprecation: true` and `Sunset: <ISO 8601>` headers (RFC 8594) for at least 6 months.

---

## 8. Mock parity (MSW)

The frontend `src/mocks/` directory ships an MSW implementation of every endpoint listed above. Behaviors:

- Realistic seed data for all 12 domains in `src/mocks/fixtures/seeds.ts`.
- Cursor pagination, filtering, and sorting for all list endpoints.
- In-memory state survives within a session (resets on page reload).
- The Ask streaming endpoint emits real SSE frames matching `AskStreamEvent`.
- A few "trap" inputs simulate failures:
  - `email=error@*` on login → 401 invalid credentials.
  - `email=taken@*` on signup → 409 email taken.
  - Short passwords → 400 password weak.

Toggle MSW with `NEXT_PUBLIC_API_MOCKING=enabled` env var.

---

## 9. Backend codegen recipes

### Java + Spring Boot

```bash
# Using openapi-generator-maven-plugin
openapi-generator-cli generate \
  -i openapi/researchtrace.yaml \
  -g spring \
  -o backend-java/ \
  --additional-properties=interfaceOnly=true,useTags=true,dateLibrary=java8
```

### Go

```bash
oapi-codegen -package api -generate types,server openapi/researchtrace.yaml > backend-go/api.gen.go
```

### Node + NestJS

```bash
# nestjs-openapi-generator from this same yaml
# OR share frontend types directly via a workspace package (recommended)
```

### Python + FastAPI

```bash
# fastapi-code-generator
fastapi-codegen --input openapi/researchtrace.yaml --output backend-python/
```

---

## 10. Open questions / future work

Items that are **deliberately out of scope for v1**:

- **Realtime push** beyond SSE: WebSockets / WebPush will be added in v1.1 once notification volume warrants.
- **Team / workspace** model: current contract is single-user. v2 will add `WorkspaceId` to ownership scopes.
- **Search domain**: the `/search` page exists in the UI but currently delegates to per-domain queries (`q` parameter on each list endpoint). A dedicated `/search?global=...` endpoint will land in v1.1.
- **Webhook outbound**: customer-facing webhooks for "brief ready", "agent finished" events. v1.1.

---

## 11. Change log

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-05-09 | Initial draft for backend handoff (B2 of Phase 4 migration). |

---

*Authoritative wire spec: [`openapi/researchtrace.yaml`](../openapi/researchtrace.yaml)*
*Frontend types: [`src/types/api/`](../src/types/api/)*
*Mock implementation: [`src/mocks/`](../src/mocks/)*
