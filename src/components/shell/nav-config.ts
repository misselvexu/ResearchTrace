/**
 * Sidebar navigation config.
 *
 * Mirrors legacy js/shell.js → const NAV. Uses i18n keys; pages set
 * `activeId` on the layout to highlight the current item.
 */

export type NavItemId =
  | "today"
  | "topics"
  | "ask"
  | "briefs"
  | "inbox"
  | "search"
  | "vault"
  | "sources"
  | "topic-llm"
  | "topic-agent"
  | "topic-eval"
  | "topic-rag"
  | "topic-pm"
  | "notifications"
  | "billing"
  | "settings"
  // Public/marketing routes — kept in the type for legacy `activeId` props,
  // but intentionally NOT rendered in the workspace sidebar (they live in
  // the user-menu and PublicShell instead).
  | "pricing"
  | "about"
  | "changelog"
  | "landing";

export type NavEntry =
  | { kind: "section"; key: string }
  | {
      kind: "item";
      id: NavItemId;
      key: string;
      href: string;
      badge?: string;
      tone?: "topic";
    };

export const NAV: NavEntry[] = [
  { kind: "section", key: "shell.section.workspace" },
  { kind: "item", id: "today", key: "nav.today", href: "/today" },
  { kind: "item", id: "topics", key: "nav.topics", href: "/topics", badge: "12" },
  { kind: "item", id: "ask", key: "nav.ask", href: "/ask" },
  { kind: "item", id: "briefs", key: "nav.briefs", href: "/briefs", badge: "3" },
  { kind: "item", id: "inbox", key: "nav.inbox", href: "/inbox", badge: "47" },
  { kind: "item", id: "search", key: "nav.search", href: "/search" },
  { kind: "item", id: "vault", key: "nav.vault", href: "/vault" },
  { kind: "item", id: "sources", key: "nav.sources", href: "/sources" },
  { kind: "section", key: "shell.section.pinned" },
  {
    kind: "item",
    id: "topic-llm",
    key: "nav.topic.llm",
    href: "/topic?t=llm-longctx",
    tone: "topic",
  },
  {
    kind: "item",
    id: "topic-agent",
    key: "nav.topic.agent",
    href: "/topic?t=agentic",
    tone: "topic",
  },
  {
    kind: "item",
    id: "topic-eval",
    key: "nav.topic.eval",
    href: "/topic?t=eval",
    tone: "topic",
  },
  {
    kind: "item",
    id: "topic-rag",
    key: "nav.topic.rag",
    href: "/topic?t=rag",
    tone: "topic",
  },
  {
    kind: "item",
    id: "topic-pm",
    key: "nav.topic.pm",
    href: "/topic?t=pm",
    tone: "topic",
  },
  { kind: "section", key: "shell.section.account" },
  { kind: "item", id: "notifications", key: "nav.notifications", href: "/notifications", badge: "5" },
  { kind: "item", id: "billing", key: "nav.billing", href: "/billing" },
  { kind: "item", id: "settings", key: "nav.settings", href: "/settings" },
];
