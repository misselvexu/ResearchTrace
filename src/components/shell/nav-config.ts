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
  | "topic-llm"
  | "topic-agent"
  | "topic-eval"
  | "topic-rag"
  | "topic-pm"
  | "settings"
  | "pricing"
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
  { kind: "item", id: "settings", key: "nav.settings", href: "/settings" },
  { kind: "item", id: "pricing", key: "nav.pricing", href: "/pricing" },
  { kind: "item", id: "landing", key: "nav.landing", href: "/" },
];
