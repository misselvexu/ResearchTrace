/* Shared shell: sidebar + topbar injection.
   Each page sets <body data-page="today"> etc. so we highlight nav. */

const NAV = [
  { section: "WORKSPACE" },
  { id: "today",    label: "Today",    href: "today.html",    badge: "" },
  { id: "topics",   label: "Topics",   href: "topics.html",   badge: "12" },
  { id: "ask",      label: "Ask",      href: "ask.html",      badge: "" },
  { id: "briefs",   label: "Briefs",   href: "briefs.html",   badge: "3" },
  { id: "inbox",    label: "Inbox",    href: "inbox.html",    badge: "47" },
  { section: "PINNED TOPICS" },
  { id: "topic-llm",     label: "LLM Long Context",   href: "topic.html?t=llm-longctx",   tone: "topic" },
  { id: "topic-agent",   label: "Agentic Workflows",  href: "topic.html?t=agentic",       tone: "topic" },
  { id: "topic-eval",    label: "AI Evaluation",      href: "topic.html?t=eval",          tone: "topic" },
  { id: "topic-rag",     label: "RAG & Memory",       href: "topic.html?t=rag",           tone: "topic" },
  { id: "topic-pm",      label: "AI Product Strategy",href: "topic.html?t=pm",            tone: "topic" },
  { section: "ACCOUNT" },
  { id: "settings", label: "Settings", href: "settings.html" },
  { id: "pricing",  label: "Pricing",  href: "pricing.html" },
  { id: "landing",  label: "Landing Page",  href: "../index.html" },
];

function buildSidebar(activeId) {
  const items = NAV.map(item => {
    if (item.section) {
      return `<div class="nav-section">${item.section}</div>`;
    }
    const active = item.id === activeId ? " is-active" : "";
    const dot = item.tone === "topic" ? `<span style="width:6px;height:6px;border-radius:50%;background:var(--accent-red-soft);display:inline-block"></span>` : "";
    const badge = item.badge ? `<span class="ml-auto chip-dark">${item.badge}</span>` : "";
    return `<a href="${item.href}" class="nav-item${active}">
      ${dot}<span>${item.label}</span>${badge}
    </a>`;
  }).join("");

  return `
    <aside class="sidebar fade-up" style="width:248px;min-width:248px;height:100vh;position:sticky;top:0;display:flex;flex-direction:column;overflow-y:auto;">
      <div style="padding:22px 18px 14px;border-bottom:1px solid var(--rule-on-dark);">
        <a href="today.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:1.5px solid var(--accent-red);color:var(--accent-red);font-family:var(--font-serif);font-weight:700;font-size:15px;">研</span>
          <span style="font-family:var(--font-serif);font-size:18px;font-weight:600;color:#fff;letter-spacing:.01em;">研迹</span>
          <span class="font-mono" style="font-size:9px;color:var(--ink-mute-on-dark);letter-spacing:.18em;">RESEARCH<br/>TRACE</span>
        </a>
      </div>
      <nav style="flex:1;padding:6px 0 14px;">${items}</nav>
      <div style="padding:14px 16px;border-top:1px solid var(--rule-on-dark);font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;color:#6F6760;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>VAULT</span>
          <span style="color:var(--ink-mute-on-dark);">2,438 ITEMS</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>BRIEFS</span>
          <span style="color:var(--ink-mute-on-dark);">36 ARCHIVED</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>PLAN</span>
          <span style="color:var(--accent-red-soft);">RESEARCH PRO</span>
        </div>
      </div>
    </aside>
  `;
}

function buildTopbar(opts = {}) {
  const crumb = opts.crumb || "";
  return `
    <header style="position:sticky;top:0;z-index:30;background:rgba(250,247,242,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--divider);">
      <div style="display:flex;align-items:center;gap:18px;padding:14px 32px;">
        <div class="font-mono" style="font-size:11px;letter-spacing:.16em;color:var(--ink-tertiary);text-transform:uppercase;">
          ${crumb || 'RESEARCHTRACE / WORKSPACE'}
        </div>
        <div style="flex:1;display:flex;justify-content:center;">
          <div onclick="window.location.href='ask.html'" class="clickable" style="display:flex;align-items:center;gap:10px;width:520px;max-width:100%;background:var(--bg-card);border:1px solid var(--divider);border-radius:6px;padding:8px 14px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink-tertiary)"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <span style="color:var(--ink-tertiary);font-size:13px;flex:1">Ask anything across your knowledge…</span>
            <span class="font-mono" style="font-size:10px;letter-spacing:.1em;color:var(--ink-tertiary);border:1px solid var(--divider);padding:1px 5px;border-radius:3px;">⌘K</span>
          </div>
        </div>
        <a href="inbox.html" title="Inbox" class="clickable" style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid var(--divider);border-radius:4px;color:var(--ink-secondary);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          <span style="position:absolute;top:-4px;right:-4px;background:var(--accent-red);color:#fff;font-family:var(--font-mono);font-size:9px;padding:1px 4px;border-radius:8px;">47</span>
        </a>
        <a href="settings.html" class="clickable" style="display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border:1px solid var(--divider);border-radius:20px;text-decoration:none;color:var(--ink-primary);">
          <img src="assets/img/avatar.png" alt="" style="width:24px;height:24px;border-radius:50%;object-fit:cover;background:var(--bg-paper-deep);"/>
          <span style="font-size:12px;">郁文</span>
        </a>
      </div>
    </header>
  `;
}

function mountShell({ activeId, crumb }) {
  // Build layout: sidebar | content
  const root = document.getElementById("app");
  if (!root) return;
  const html = `
    <div style="display:flex;min-height:100vh;">
      ${buildSidebar(activeId)}
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
        ${buildTopbar({ crumb })}
        <main id="main" style="flex:1;"></main>
      </div>
    </div>
  `;
  root.innerHTML = html;
}

window.RT = { mountShell, NAV };
