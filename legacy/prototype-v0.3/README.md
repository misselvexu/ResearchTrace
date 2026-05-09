<div align="center">

# 研迹 · ResearchTrace

### *A Paper for One Reader. You.*

**An active research personal knowledge system — built on the conviction that every claim should be traceable, every answer should be auditable, and every library should belong to its reader, not the model.**

---

[![Status](https://img.shields.io/badge/status-prototype%20v0.3-A82A2A?style=for-the-badge)](#)
[![Design](https://img.shields.io/badge/design-Research%20Digest-1A1A1A?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-555555?style=for-the-badge)](#)
[![Made with](https://img.shields.io/badge/built%20with-HTML%20%C2%B7%20CSS%20%C2%B7%20Vanilla%20JS-FAF7F2?style=for-the-badge&labelColor=1A1A1A)](#)

[**Live Demo**](https://8080-ip7xb58bpv748psg17a6a-0e616f0a.sandbox.novita.ai/index.html) · [**Design Manifesto**](#-design-manifesto) · [**Architecture**](#-architecture) · [**Pages**](#-pages--routes)

</div>

---

## ✦ The Premise

> *Search engines made information abundant.*  
> *Chatbots made answers cheap.*  
> *Neither made you smarter.*

**ResearchTrace** is a quiet rebellion against the modern reading stack. We do not collect your attention; we organize your *trace*. Every PDF you saved at 2 a.m., every tweet that made you pause, every paper you almost understood — they form a private corpus that only *you* can question, and only *you* should own.

This is not a chatbot. This is not a notes app. This is a **personal research desk** with five autonomous agents who work the night shift on your behalf, and a morning brief — printed on paper-white pixels — that arrives the moment you open your laptop.

---

## ✦ Design Manifesto

We rejected the prevailing AI-product aesthetic — the gradient blurs, the glassmorphic panels, the neon-on-black "futurism." Instead, we drew from a quieter tradition: **the printed research digest**. *The Economist*'s leader columns. *MIT Technology Review*'s typography. The serif gravity of academic abstracts. The monospace candor of terminal logs.

| Token | Value | Intent |
|---|---|---|
| `--bg-paper` | `#FAF7F2` | The warmth of uncoated paper, not the chill of #FFFFFF |
| `--accent-red` | `#A82A2A` | A scholarly red — the color of corrections in margins |
| `--ink-primary` | `#1A1A1A` | Ink, not pure black — easier on the morning eye |
| `--font-serif` | *Source Serif 4* | Headlines carry weight, not just attention |
| `--font-mono` | *JetBrains Mono* | Metadata is data; data deserves a monospace |

**Visual signatures** that define the language:

- **Watermark numerals** — oversized serif numbers behind section headers, the way old journals print volume numbers
- **The HEAT meter** — five vertical bars that signal trending intensity without resorting to a bar chart
- **Editor's Brief callouts** — bordered, italicized leader paragraphs reminiscent of letterpress pull quotes
- **Action pills** — flat, uppercase, monospace — like a stamped form button on a library card
- **Tag pills** — `LONG-CONTEXT` `RAG` `ALIGNMENT` — taxonomy as typography
- **Citation bubbles** — every numbered superscript is a live link, traceable to a real source

---

## ✦ The Five Agents

The product runs on five autonomous workers, each with a single mandate, each with a name borrowed from the editorial workflow of a real newsroom.

```
01 ─ INGESTOR    │ Captures everything you save — PDFs, URLs, tweets, videos, emails
02 ─ CURATOR     │ Reads, deduplicates, summarizes, and shelves it under the right topic
03 ─ RETRIEVER   │ Answers your questions with citations from your own library, never the open web
04 ─ RADAR       │ Watches your topics overnight; surfaces what changed and what's worth your morning
05 ─ REPORTER    │ Drafts a six-section daily brief, printed on paper-white, before you wake
```

Every action of every agent is **logged, timestamped, and reversible**. There are no black boxes here. If the system made a claim, you can ask *which document, which page, which sentence*. Always.

---

## ✦ Why ResearchTrace Exists

Four convictions, written in the order they arrived.

**01 · Passive collection becomes active forgetting.**  
Bookmarks pile up. Read-later queues become read-never queues. ResearchTrace turns saved items into structured knowledge nodes the moment they enter the system — not when (if) you revisit them.

**02 · An answer is not research.**  
A chatbot reply terminates inquiry. A research system extends it. Every answer here arrives with its evidence in a side panel, and every claim is one click away from the page it came from.

**03 · Cycles, not queries.**  
You don't research a topic in a single session. You return to it for weeks. ResearchTrace organizes around *topics* — long-lived, evolving, with timelines and pulse charts — not around chats that vanish.

**04 · Your library belongs to you, not to the model.**  
End-to-end encrypted. Excluded from training corpora. Exportable in open formats. The vault is yours; we are merely the librarians.

---

## ✦ Architecture

A deliberately small surface area. No build step. No framework. No bundler. Just web standards.

```
ResearchTrace/
├── index.html              · Landing — the public storefront, pure static HTML, SEO-first
├── onboarding.html         · A four-step wizard: role → topics → sources → first brief
├── today.html              · The morning brief — your home after login
├── topics.html             · Twelve topic cards, filterable by ALL/ACTIVE/WATCHING/PINNED
├── topic.html              · Six-tab topic detail (overview/sources/claims/evidence/radar/briefs)
├── ask.html                · Three-pane Q&A — history · answer with citations · source viewer
├── inbox.html              · Forty-seven items, type-badged, parsing/indexed status
├── briefs.html             · Featured brief plus nine archived issues
├── brief.html              · A single brief, six sections, newspaper-style reading view
├── settings.html           · Profile · delivery · agents · sources · plan · data export
├── pricing.html            · Free $0 · Pro $15 · Research Pro $29 · Team $99
│
├── css/
│   └── tokens.css          · Design tokens: color · typography · component primitives
├── js/
│   └── shell.js            · Shared shell: NAV array, sidebar, topbar, mountShell()
│
├── assets/
│   └── img/                · Nine illustrations generated via gpt-image-2
│       ├── hero-graph.png
│       ├── agents-diagram.png
│       ├── thumb-longctx · thumb-agentic · thumb-bench
│       ├── thumb-rag · thumb-align · thumb-strategy
│       └── avatar.png
│
├── favicon.svg             · Scholarly red square, 研 character set in serif
└── README.md               · This document
```

**Two render strategies.** The landing page (`index.html`) is intentionally pure static HTML — for SEO, for first paint, for graceful degradation. Every authenticated page mounts its content via a single `<script>`-injected template literal — for component composition without a build pipeline. The split is deliberate.

---

## ✦ Pages & Routes

| Route | Role | Headline Element |
|---|---|---|
| `/index.html` | Landing | Hero stats strip · Why-grid · Workflow timeline · Agents row · Footer |
| `/onboarding.html` | First-run wizard | Four sequential cards, no skipping |
| `/today.html` | Daily home | Editor's Brief · 3 top stories · Radar Pulse · From Your Vault · Ask Agent |
| `/topics.html` | Topic library | Twelve cards · ALL / ACTIVE / WATCHING / PINNED filters |
| `/topic.html` | Topic detail | Six tabs — Overview · Sources · Claims · Evidence · Radar · Briefs |
| `/ask.html` | Question desk | History rail · answer canvas · evidence panel — citations are live |
| `/inbox.html` | Capture queue | Forty-seven items · PDF/URL/Twitter/YouTube/Email/Notion type badges |
| `/briefs.html` | Brief archive | Featured brief plus nine back-issues, dated and titled |
| `/brief.html` | Brief reader | Six sections · 11-minute read · every claim cited |
| `/settings.html` | Account | Six anchor sections · profile through data export |
| `/pricing.html` | Plans | Four tiers · Research Pro highlighted as the home for serious readers |

Every visible link is wired. Every button reaches a destination. Every numbered citation is clickable.

---

## ✦ Run Locally

No dependencies. No install. No build.

```bash
git clone https://github.com/misselvexu/ResearchTrace.git
cd ResearchTrace
python3 -m http.server 8080
open http://localhost:8080/index.html
```

That's the entire setup. Pure web standards, intentionally.

---

## ✦ Type System

| Role | Family | Weight | Use |
|---|---|---|---|
| Display | *Source Serif 4* | 600 | Section headlines, brief titles, watermark numerals |
| Body | *Source Serif 4* | 400 | Long-form reading copy, callout blocks |
| UI | System sans (`-apple-system`, *Inter* fallback) | 500 | Navigation, buttons, labels |
| Mono | *JetBrains Mono* | 400 / 600 | Timestamps, tags, agent names, citations, metadata |

Set in CSS variables, not utility classes. Designed once, consumed everywhere.

---

## ✦ Roadmap

| Phase | Milestone | State |
|---|---|---|
| **0.1** | Design tokens, type system, shared shell | ✦ shipped |
| **0.2** | Eleven static pages, full inter-linking, image assets | ✦ shipped |
| **0.3** | Comprehensive bug sweep, landing-page static expansion | ✦ shipped |
| **0.4** | Real local-first storage layer (IndexedDB / OPFS) | — planned |
| **0.5** | Live agent runtime — Ingestor → Curator → Retriever | — planned |
| **0.6** | Brief generation pipeline with citation graph | — planned |
| **1.0** | End-to-end encrypted vault · open-format export · public beta | — planned |

This repository represents the design and interaction prototype of **v0.3** — every page, every interaction, every visual signature is in place. The runtime is the next chapter.

---

## ✦ Credits

- **Type** — *Source Serif 4* by Frank Grießhammer · *JetBrains Mono* by JetBrains
- **Imagery** — Nine original illustrations, generated with GPT Image 2
- **Spiritual ancestors** — *The Economist* leader column · *MIT Technology Review* feature spreads · *Edward Tufte*'s small multiples · the morning paper that used to land at the door

---

<div align="center">

### *Built for the reader who still believes that knowing where a fact came from is part of knowing the fact.*

**ResearchTrace** — *A Paper for One Reader. You.*

`研迹` — the trace of inquiry; the residue of having paid attention.

---

<sub>Copyright © 2026 · Released under the MIT License.</sub>

</div>
