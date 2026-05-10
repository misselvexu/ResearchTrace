"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type Section = "today" | "yesterday" | "earlier";
type Kind = "alert" | "digest" | "mention" | "system" | "ingest";
type Actor = "radar" | "reporter" | "ingestor" | "curator" | "system" | "billing";
type FilterKey = "all" | "unread" | "mentions" | "system" | "digest" | "alerts";

type NotifItem = {
  k: string;
  section: Section;
  kind: Kind;
  actor: Actor;
  unread: boolean;
  href: string;
};

const ITEMS: NotifItem[] = [
  { k: "1", section: "today", kind: "alert", actor: "radar", unread: true, href: "/today" },
  { k: "2", section: "today", kind: "digest", actor: "reporter", unread: true, href: "/briefs/127" },
  { k: "3", section: "today", kind: "ingest", actor: "ingestor", unread: true, href: "/inbox" },
  { k: "4", section: "today", kind: "mention", actor: "curator", unread: true, href: "/today" },
  { k: "5", section: "yesterday", kind: "ingest", actor: "ingestor", unread: false, href: "/vault" },
  { k: "6", section: "yesterday", kind: "system", actor: "system", unread: false, href: "/sources" },
  { k: "7", section: "yesterday", kind: "digest", actor: "reporter", unread: true, href: "/briefs" },
  { k: "8", section: "yesterday", kind: "system", actor: "billing", unread: true, href: "/billing" },
  { k: "9", section: "earlier", kind: "ingest", actor: "ingestor", unread: false, href: "/inbox" },
  { k: "10", section: "earlier", kind: "mention", actor: "curator", unread: true, href: "/today" },
  { k: "11", section: "earlier", kind: "system", actor: "system", unread: false, href: "/" },
  { k: "12", section: "earlier", kind: "system", actor: "billing", unread: false, href: "/billing" },
];

const SECTIONS: Section[] = ["today", "yesterday", "earlier"];

const KIND_COLOR: Record<Kind, string> = {
  alert: "var(--accent-red)",
  digest: "var(--info-blue)",
  mention: "var(--warning-amber)",
  system: "var(--ink-tertiary)",
  ingest: "var(--success-green)",
};

const FILTERS: { key: FilterKey; labelK: string }[] = [
  { key: "all", labelK: "notifications.f.all" },
  { key: "unread", labelK: "notifications.f.unread" },
  { key: "alerts", labelK: "notifications.f.alerts" },
  { key: "digest", labelK: "notifications.f.digest" },
  { key: "mentions", labelK: "notifications.f.mentions" },
  { key: "system", labelK: "notifications.f.system" },
];

export default function NotificationsPage() {
  const t = useTranslations();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [readSet, setReadSet] = useState<Set<string>>(
    () => new Set(ITEMS.filter((i) => !i.unread).map((i) => i.k))
  );

  const isUnread = (k: string) => !readSet.has(k);

  const visible = ITEMS.filter((it) => {
    if (filter === "all") return true;
    if (filter === "unread") return isUnread(it.k);
    if (filter === "alerts") return it.kind === "alert";
    if (filter === "digest") return it.kind === "digest";
    if (filter === "mentions") return it.kind === "mention";
    if (filter === "system") return it.kind === "system";
    return true;
  });

  const unreadCount = ITEMS.filter((it) => isUnread(it.k)).length;
  const todayCount = ITEMS.filter((it) => it.section === "today").length;
  const mentionCount = ITEMS.filter((it) => it.kind === "mention").length;
  const systemCount = ITEMS.filter((it) => it.kind === "system").length;
  const digestCount = ITEMS.filter((it) => it.kind === "digest").length;

  const markRead = (k: string) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };

  const markAll = () => {
    setReadSet(new Set(ITEMS.map((i) => i.k)));
    toast(t("notifications.alert.markAllDone"));
  };

  return (
    <AppLayout activeId="notifications" crumbKey="notifications.crumb">
      {/* Masthead */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("notifications.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 44, margin: 0 }}>{t("notifications.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0", fontSize: 15.5, maxWidth: 720 }}
                dangerouslySetInnerHTML={{ __html: t.raw("notifications.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="watermark-number" style={{ fontSize: 96 }}>{t("notifications.watermark")}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
            {([
              ["notifications.stat.unread", unreadCount, "var(--accent-red)"],
              ["notifications.stat.today", todayCount, "var(--ink-primary)"],
              ["notifications.stat.mentions", mentionCount, "var(--warning-amber)"],
              ["notifications.stat.system", systemCount, "var(--ink-tertiary)"],
              ["notifications.stat.digest", digestCount, "var(--info-blue)"],
            ] as const).map(([lk, n, c]) => (
              <div key={lk}>
                <div className="font-serif" style={{ fontSize: 24, fontWeight: 600, color: c, lineHeight: 1 }}>{n}</div>
                <div className="kicker" style={{ fontSize: 10, marginTop: 2 }}>{t(lk)}</div>
              </div>
            ))}
          </div>

          {/* Filter + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
            <span className="kicker">{t("notifications.filter")}</span>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`pill ${filter === f.key ? "is-active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {t(f.labelK)}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <Link href="/settings" className="btn btn-ghost" style={{ textDecoration: "none" }}>
              {t("notifications.btn.settings")}
            </Link>
            <button className="btn btn-red" onClick={markAll}>{t("notifications.btn.markAll")}</button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 48px 64px" }}>
          {SECTIONS.map((sec) => {
            const rows = visible.filter((it) => it.section === sec);
            if (rows.length === 0) return null;
            return (
              <div key={sec} style={{ marginBottom: 32 }}>
                <div
                  className="rule-kicker"
                  style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 12 }}
                >
                  <span className="kicker-red">{t(`notifications.section.${sec}`)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {rows.map((it) => {
                    const unread = isUnread(it.k);
                    const title = t(`notifications.item.${it.k}.title`);
                    const body = t(`notifications.item.${it.k}.body`);
                    const time = t(`notifications.item.${it.k}.time`);
                    const actor = t(`notifications.actor.${it.actor}`);
                    const kind = t(`notifications.kind.${it.kind}`);
                    return (
                      <article
                        key={it.k}
                        className="paper-card"
                        style={{
                          padding: "14px 18px",
                          display: "grid",
                          gridTemplateColumns: "8px 130px 1fr 90px 130px",
                          gap: 14,
                          alignItems: "flex-start",
                          opacity: unread ? 1 : 0.72,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: unread ? "var(--accent-red)" : "transparent",
                            border: unread ? "none" : "1px solid var(--divider-strong)",
                            marginTop: 8,
                          }}
                        />
                        <div>
                          <div className="kicker" style={{ fontSize: 9, color: KIND_COLOR[it.kind] }}>
                            {actor}
                          </div>
                          <div
                            className="kicker"
                            style={{
                              fontSize: 9,
                              marginTop: 2,
                              color: "var(--ink-tertiary)",
                              fontStyle: "italic",
                              fontFamily: "var(--font-serif)",
                              textTransform: "none",
                              letterSpacing: 0,
                            }}
                          >
                            {kind}
                          </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            className="font-serif"
                            style={{
                              fontSize: 15.5,
                              fontWeight: unread ? 600 : 500,
                              lineHeight: 1.35,
                              marginBottom: 4,
                              color: "var(--ink-primary)",
                            }}
                          >
                            {title}
                          </div>
                          <div
                            className="font-serif"
                            style={{
                              fontSize: 13,
                              lineHeight: 1.5,
                              color: "var(--ink-secondary)",
                              fontStyle: "italic",
                            }}
                          >
                            {body}
                          </div>
                        </div>
                        <div className="kicker" style={{ fontSize: 10, textAlign: "right" }}>
                          {time}
                        </div>
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          {unread && (
                            <button
                              className="pill"
                              style={{ fontSize: 9, padding: "1px 6px" }}
                              onClick={() => markRead(it.k)}
                            >
                              ✓
                            </button>
                          )}
                          <Link
                            href={it.href}
                            className="pill"
                            style={{
                              fontSize: 9,
                              padding: "1px 6px",
                              textDecoration: "none",
                              color: "var(--accent-red)",
                              borderColor: "currentColor",
                            }}
                            onClick={() => markRead(it.k)}
                          >
                            {t("notifications.btn.openSrc")}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-tertiary)" }}>
              <div className="kicker" style={{ marginBottom: 8 }}>NO MATCH</div>
              <div className="font-serif" style={{ fontSize: 18, fontStyle: "italic" }}>—</div>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
