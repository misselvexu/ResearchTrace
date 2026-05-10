# 研迹 ResearchTrace

A production-grade Next.js port of the v0.3 static prototype — *A Paper for One Reader. You.*

> Editorial-newspaper aesthetic for personal research: a workspace that turns long-form reading
> into briefs, citations and recallable knowledge. 100 % pixel-faithful to the original HTML
> mock-up across light & dark themes, English & Chinese.

---

## Stack

| Layer            | Tool / Version                                  |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js **16.2.6** (App Router · Turbopack)     |
| Language         | TypeScript **5.9.3** (strict)                   |
| UI runtime       | React **19.2.4**                                |
| Styling          | Tailwind CSS **4.3.0** (CSS-first `@theme`)     |
| Component kit    | shadcn/ui                                       |
| i18n             | next-intl **4.11.1** (zh / en, 28 namespaces)   |
| Theme            | next-themes **0.4.6** (light / dark)            |
| Mocking          | MSW **2.14.5**                                  |
| Package manager  | pnpm **10.33.4**                                |

---

## Quick start

```bash
# Install (uses pnpm-lock.yaml)
pnpm install

# Dev server (Turbopack, port 3000)
pnpm dev

# Type-check (CI gate)
pnpm typecheck

# Production build
pnpm build

# Production server
pnpm start
```

Open <http://localhost:3000>.

The root path (`/`) reads `localStorage["rt.session.v1"]` and redirects:

* signed-in → `/today`
* signed-out → `/landing`

---

## Routes (24 total)

### Workspace (signed-in chrome — `<AppLayout>`)
* `/today`              – daily brief
* `/topics`             – topics index
* `/topic`              – single topic deep-dive
* `/ask`                – conversational research workspace (3-col)
* `/briefs`             – briefs catalogue
* `/briefs/[id]`        – brief detail
* `/inbox`              – inbox triage table
* `/search`             – global search
* `/vault`              – source vault
* `/sources`            – source manager
* `/notifications`      – notification centre
* `/billing`            – plan & invoices
* `/settings`           – preferences

### Public / marketing (`<PublicShell>`)
* `/landing`            – marketing home
* `/about`              – mission / story / team
* `/changelog`          – versioned releases
* `/pricing`            – four-tier plan grid
* `/legal/terms`        – terms of service
* `/legal/privacy`      – privacy policy
* `/share/[id]`         – public-shareable brief

### Auth flow
* `/login`              – sign-in
* `/signup`             – registration
* `/onboarding`         – 4-step intake (persists to `rt.onboarding.v1`)

### Special
* `/`                   – auth-aware redirect
* `/_not-found`         – branded 404

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages (24 routes)
├── components/
│   ├── shell/              # AppLayout + Sidebar + TopBar + PublicShell + nav-config
│   ├── providers/          # ThemeProvider · IntlProvider · PrefSwitcher · Toast
│   └── ui/                 # shadcn primitives
├── lib/                    # auth, fetchers, helpers
└── messages/               # zh.json / en.json (28 symmetric namespaces)
```

### Design tokens (CSS custom properties)
All colour, divider and ink tokens live as CSS custom properties on `:root` and `[data-theme="dark"]`.
Theming is purely CSS-driven — no JS recolouring. Key tokens:

```
--accent-red          # primary kicker / CTA
--accent-red-soft     # tonal red for dark surfaces
--bg-paper            # canvas
--bg-card             # raised surface
--bg-sidebar          # workspace rail (always dark)
--rule-on-dark        # divider on dark surfaces
--ink-primary/secondary/tertiary
--success-green --warning-amber --info-blue
```

### Interaction layer (B6)
* **Toast** — global toast bus via `<ToastHost />`. API: `toast()`, `.success()`, `.info()`, `.warn()`, `.error()`. ARIA-live, auto-dismiss 2.6 s (3.6 s for errors).
* **Auth** — `localStorage`-backed session (`rt.session.v1`). Helpers in `src/lib/auth.ts`.
* **Onboarding** — multi-step state persisted to `rt.onboarding.v1`.

### Responsive (B7)
A single declarative responsive layer at the bottom of `globals.css` covers four breakpoints:

| Breakpoint  | Behaviour                                                                |
| ----------- | ------------------------------------------------------------------------ |
| ≤ 1280 px   | Sidebar narrows to 220 px                                                |
| ≤ 1024 px   | Sidebar collapses to a horizontal scroll-rail; 3-col layouts → 1 col     |
| ≤ 768 px    | All inline `gridTemplateColumns` stack to 1fr; headlines 28 px; padding 16 px |
| ≤ 480 px    | Watermark numbers hidden; kickers 10 px; main padding 12 px              |

Hooks:
* `<AppLayout>` and `<PublicShell>` carry `data-responsive="app"|"public"`.
* `Sidebar` exposes `.rt-sidebar`, `.rt-sidebar-brand`, `.rt-sidebar-footer`.
* `TopBar` exposes `.rt-topbar`, `.rt-topbar-search`, `.rt-topbar-crumb`.
* Auth screens carry `data-rt-auth-card`.

Plus a a11y layer:
* `:focus-visible` red ring on every interactive element (white ring inside the dark sidebar).
* `.skip-link` keyboard skip target on every layout.
* `prefers-reduced-motion` honours user preference.
* Print stylesheet hides chrome (sidebar/topbar/footer).

---

## i18n contract

`messages/zh.json` and `messages/en.json` are **strictly symmetric** — every leaf in one file
must exist in the other. Verify locally:

```bash
python3 -c '
import json
def walk(o, p=""):
    if isinstance(o, dict):
        for k,v in o.items(): yield from walk(v, f"{p}.{k}" if p else k)
    else: yield p
zh = set(walk(json.load(open("messages/zh.json"))))
en = set(walk(json.load(open("messages/en.json"))))
print("zh-only:", zh-en, "\nen-only:", en-zh)
'
```

When using a key whose value is itself an object, request the explicit `_value` leaf:

```ts
t("shell.vault._value")   // ✓ ok
t("shell.vault")          // ✗ throws
```

---

## Build / verify gate

CI gate before opening a PR:

```bash
pnpm typecheck && pnpm build
```

Both must pass. The build emits 24 dynamic routes (server-rendered on demand) — no static
generation is required.

---

## Deploy

Standard Next.js production deployment:

```bash
pnpm install --prod=false
pnpm build
PORT=3000 pnpm start
```

The build is platform-agnostic (no edge runtime, no incompatible APIs). Tested deploy targets:
Vercel, Cloudflare Pages with `@cloudflare/next-on-pages`, any Node 20+ host.

---

## Phase ledger

* **B1** bootstrap — Next.js + Tailwind 4 + shadcn skeleton
* **B2** data contract — i18n namespaces, design tokens, primitives
* **B3** Today sample
* **B4.1–4.3** Topics / Ask / Briefs / Inbox / Topic
* **B5.1** Settings · Pricing · Onboarding · Landing
* **B5.2** Login · Signup · 404
* **B5.3** Sources · Vault · Search · Notifications · Billing · Share
* **B5.4** About · Changelog · Legal/Terms · Legal/Privacy · `<PublicShell>`
* **B6**   Toast bus · localStorage auth · nav expansion (13 → 20 ids)
* **B7**   Responsive sweep · a11y · final verification

---

## License

Internal — see `legal/terms` route within the app.
