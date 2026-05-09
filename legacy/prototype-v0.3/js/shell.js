/* Shared shell: sidebar + topbar injection.
   Each page sets <body data-page="today"> etc. so we highlight nav.
   Texts go through RTI18n.t() so they update on language switch. */

const NAV = [
  { section: true, key: "shell.section.workspace" },
  { id: "today",    key: "nav.today",    href: "today.html",    badge: "" },
  { id: "topics",   key: "nav.topics",   href: "topics.html",   badge: "12" },
  { id: "ask",      key: "nav.ask",      href: "ask.html",      badge: "" },
  { id: "briefs",   key: "nav.briefs",   href: "briefs.html",   badge: "3" },
  { id: "inbox",    key: "nav.inbox",    href: "inbox.html",    badge: "47" },
  { section: true, key: "shell.section.pinned" },
  { id: "topic-llm",     key: "nav.topic.llm",   href: "topic.html?t=llm-longctx",   tone: "topic" },
  { id: "topic-agent",   key: "nav.topic.agent", href: "topic.html?t=agentic",       tone: "topic" },
  { id: "topic-eval",    key: "nav.topic.eval",  href: "topic.html?t=eval",          tone: "topic" },
  { id: "topic-rag",     key: "nav.topic.rag",   href: "topic.html?t=rag",           tone: "topic" },
  { id: "topic-pm",      key: "nav.topic.pm",    href: "topic.html?t=pm",            tone: "topic" },
  { section: true, key: "shell.section.account" },
  { id: "settings", key: "nav.settings", href: "settings.html" },
  { id: "pricing",  key: "nav.pricing",  href: "pricing.html" },
  { id: "landing",  key: "nav.landing",  href: "index.html" },
];

function _t(k, fb) { return (window.RTI18n && window.RTI18n.t) ? window.RTI18n.t(k, fb) : (fb != null ? fb : k); }

/* ----- Lang + Theme switcher (used in topbar AND landing nav) ----- */
function buildPrefSwitch(opts) {
  opts = opts || {};
  const onDark = opts.onDark ? " on-dark" : "";
  // Sun + moon SVGs (only one shows per theme via CSS)
  const moon = `<svg class="rt-icon-moon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sun  = `<svg class="rt-icon-sun"  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;
  return `
    <div class="rt-switch${onDark}" role="group" aria-label="Preferences">
      <button type="button" data-rt-action="toggle-lang"
              data-i18n-title="switcher.lang.title"
              title="Toggle language">
        <span data-i18n="switcher.lang.label">EN</span>
      </button>
      <span class="divider" aria-hidden="true"></span>
      <button type="button" data-rt-action="toggle-theme"
              data-i18n-title="switcher.theme.title.toDark"
              title="Toggle theme">
        ${moon}${sun}
      </button>
    </div>
  `;
}

/* Wires switcher click handlers on a given root (delegated). Idempotent. */
function wirePrefSwitch(root) {
  const scope = root || document;
  scope.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-rt-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-rt-action");
    if (action === "toggle-lang")  window.RTPrefs && window.RTPrefs.toggleLang();
    if (action === "toggle-theme") window.RTPrefs && window.RTPrefs.toggleTheme();
  });
  // Update theme tooltip whenever theme changes
  const refreshThemeTitle = () => {
    const isDark = (window.RTPrefs && window.RTPrefs.getTheme && window.RTPrefs.getTheme() === "dark");
    scope.querySelectorAll('[data-rt-action="toggle-theme"]').forEach(el => {
      el.setAttribute("data-i18n-title", isDark ? "switcher.theme.title.toLight" : "switcher.theme.title.toDark");
    });
    if (window.RTI18n) window.RTI18n.apply(scope);
  };
  document.addEventListener("rt:themechange", refreshThemeTitle);
  refreshThemeTitle();
}

function buildSidebar(activeId) {
  const items = NAV.map(item => {
    if (item.section) {
      return `<div class="nav-section" data-i18n="${item.key}">${_t(item.key)}</div>`;
    }
    const active = item.id === activeId ? " is-active" : "";
    const dot = item.tone === "topic" ? `<span style="width:6px;height:6px;border-radius:50%;background:var(--accent-red-soft);display:inline-block"></span>` : "";
    const badge = item.badge ? `<span class="ml-auto chip-dark">${item.badge}</span>` : "";
    return `<a href="${item.href}" class="nav-item${active}">
      ${dot}<span data-i18n="${item.key}">${_t(item.key)}</span>${badge}
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
          <span data-i18n="shell.vault">VAULT</span>
          <span style="color:var(--ink-mute-on-dark);" data-i18n="shell.vault.value">2,438 ITEMS</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span data-i18n="shell.briefs">BRIEFS</span>
          <span style="color:var(--ink-mute-on-dark);" data-i18n="shell.briefs.value">36 ARCHIVED</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span data-i18n="shell.plan">PLAN</span>
          <span style="color:var(--accent-red-soft);" data-i18n="shell.plan.value">RESEARCH PRO</span>
        </div>
      </div>
    </aside>
  `;
}

function buildTopbar(opts = {}) {
  const crumb = opts.crumb || "";
  const crumbKey = opts.crumbKey || "";
  const crumbAttrs = crumbKey ? `data-i18n="${crumbKey}"` : "";
  return `
    <header style="position:sticky;top:0;z-index:30;background:var(--bg-overlay);backdrop-filter:blur(8px);border-bottom:1px solid var(--divider);">
      <div style="display:flex;align-items:center;gap:18px;padding:14px 32px;">
        <div class="font-mono" style="font-size:11px;letter-spacing:.16em;color:var(--ink-tertiary);text-transform:uppercase;" ${crumbAttrs}>
          ${crumb || 'RESEARCHTRACE / WORKSPACE'}
        </div>
        <div style="flex:1;display:flex;justify-content:center;">
          <div onclick="window.location.href='ask.html'" class="clickable" style="display:flex;align-items:center;gap:10px;width:520px;max-width:100%;background:var(--bg-card);border:1px solid var(--divider);border-radius:6px;padding:8px 14px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink-tertiary)"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <span style="color:var(--ink-tertiary);font-size:13px;flex:1" data-i18n="shell.search">在您的全部知识中提问…</span>
            <span class="font-mono" style="font-size:10px;letter-spacing:.1em;color:var(--ink-tertiary);border:1px solid var(--divider);padding:1px 5px;border-radius:3px;">⌘K</span>
          </div>
        </div>
        ${buildPrefSwitch({ onDark: false })}
        <a href="inbox.html" title="Inbox" class="clickable" style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid var(--divider);border-radius:4px;color:var(--ink-secondary);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          <span style="position:absolute;top:-4px;right:-4px;background:var(--accent-red);color:#fff;font-family:var(--font-mono);font-size:9px;padding:1px 4px;border-radius:8px;">47</span>
        </a>
        <a href="settings.html" class="clickable" style="display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border:1px solid var(--divider);border-radius:20px;text-decoration:none;color:var(--ink-primary);">
          <img src="assets/img/avatar.png" alt="" style="width:24px;height:24px;border-radius:50%;object-fit:cover;background:var(--bg-paper-deep);"/>
          <span style="font-size:12px;" data-i18n="shell.userName">郁文</span>
        </a>
      </div>
    </header>
  `;
}

function mountShell({ activeId, crumb, crumbKey }) {
  // Build layout: sidebar | content
  const root = document.getElementById("app");
  if (!root) return;
  const html = `
    <div style="display:flex;min-height:100vh;">
      ${buildSidebar(activeId)}
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
        ${buildTopbar({ crumb, crumbKey })}
        <main id="main" style="flex:1;"></main>
      </div>
    </div>
  `;
  root.innerHTML = html;

  // Apply translations to the freshly injected shell
  if (window.RTI18n) window.RTI18n.apply(root);
  // Wire pref switcher
  wirePrefSwitch(root);
}

/* Auto-translate after main content is injected by each page.
   Pages should call RTI18n.apply() OR rely on this mutation observer. */
function autoApplyI18n() {
  const main = document.getElementById("main");
  if (!main) return;
  // Re-apply once after initial mount + once after each batch of mutations
  const reapply = () => { if (window.RTI18n) window.RTI18n.apply(main); };
  reapply();
  const obs = new MutationObserver(() => reapply());
  obs.observe(main, { childList: true, subtree: true });
  // Also reapply on language change
  document.addEventListener("rt:langchange", reapply);
}

window.RT = { mountShell, NAV, buildPrefSwitch, wirePrefSwitch, autoApplyI18n };
