# 研迹 ResearchTrace — Prototype v0.3 (Archived)

This directory is the **frozen archive** of the static HTML prototype that
preceded the Next.js production rewrite. It is preserved for visual
reference only — **do not edit files here**.

## What this is

A pure static prototype built with vanilla HTML + CSS variables + vanilla
JS (no build step). It established:

- Visual language ("paper-of-record" / Le Monde-meets-NYT-Magazine
  serif-driven aesthetic)
- 11-page information architecture
- Bilingual (zh / en) i18n dictionary (~600 keys)
- Dark / light theme via CSS variables
- Interaction sketches (many `alert()` placeholders)

## Contents

```
prototype-v0.3/
├── *.html              # 11 prototype pages
│   index, today, topics, topic, ask, inbox, briefs, brief,
│   onboarding, settings, pricing
├── css/tokens.css      # Design tokens (colors, fonts, spacing)
├── js/
│   ├── i18n.js         # ~600-key DICT + RTI18n.t() / window.tk
│   ├── shell.js        # mountShell() — sidebar + topbar
│   └── prefs.js        # localStorage rt-lang / rt-theme
├── assets/             # Static images
├── favicon.svg
└── README.md           # Original project README
```

## Phases delivered in this archive

| Phase | Scope                                                | Status |
| ----- | ---------------------------------------------------- | ------ |
| 1     | 11-page static skeleton + design tokens              | ✅     |
| 2     | i18n (zh/en) + dark mode switcher                    | ✅     |
| 3     | Bilingual coverage ≥97% (eliminate zh leakage in EN) | ✅     |

## Why frozen

Phase 4 onwards migrates to **Next.js 15 + TypeScript + Tailwind v4 +
shadcn/ui** with a proper data-contract layer. The aesthetic, copy,
i18n dictionary, and information architecture from this prototype are
**preserved 1:1** in the new codebase; only the implementation is
upgraded.

The new codebase lives in the repository root.
This directory exists purely so designers / reviewers can compare the
new pages against the original visual reference.

## How to view this archive locally

```bash
cd legacy/prototype-v0.3
python3 -m http.server 8081
# open http://localhost:8081/index.html
```

---

**Last commit before freeze:** `5d7a6e7` — feat(i18n): wire JS-rendered
pages to ≥97% bilingual coverage
