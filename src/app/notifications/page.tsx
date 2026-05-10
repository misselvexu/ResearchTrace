"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import {
  deleteNotification,
  liveNotifRows,
  markAllNotificationsRead,
  markNotificationRead,
  statsFromNotifs,
  useNotificationsLive,
  type LegacyKind,
  type LegacySection,
  type LiveNotifRow,
} from "./notifications-data";

type FilterKey = "all" | "unread" | "mentions" | "system" | "digest" | "alerts";

const SECTIONS: LegacySection[] = ["today", "yesterday", "earlier"];

const KIND_COLOR: Record<LegacyKind, string> = {
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
  const locale = useLocale();
  const live = useNotificationsLive({ limit: 50 });
  const [filter, setFilter] = useState<FilterKey>("all");

  const rows: LiveNotifRow[] = useMemo(
    () => liveNotifRows(live.items, locale),
    [live.items, locale],
  );
  const stats = useMemo(() => statsFromNotifs(live.items), [live.items]);

  const visible = rows.filter((it) => {
    if (filter === "all") return true;
    if (filter === "unread") return it.unread;
    if (filter === "alerts") return it.kind === "alert";
    if (filter === "digest") return it.kind === "digest";
    if (filter === "mentions") return it.kind === "mention";
    if (filter === "system") return it.kind === "system";
    return true;
  });

  const onRead = async (row: LiveNotifRow) => {
    if (!row.unread) return;
    const ok = await markNotificationRead(row.id, t);
    if (ok) live.refresh();
  };

  const onMarkAll = async () => {
    const ok = await markAllNotificationsRead(t);
    if (ok) live.refresh();
  };

  const onDelete = async (row: LiveNotifRow) => {
    if (typeof window === "undefined") return;
    if (!window.confirm(t("notifications.alert.confirmDelete"))) return;
    const ok = await deleteNotification(row.id, t);
    if (ok) live.refresh();
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

          {/* Stats — overlaid from live */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--divider)" }}>
            {([
              ["notifications.stat.unread", stats.unread, "var(--accent-red)"],
              ["notifications.stat.today", stats.today, "var(--ink-primary)"],
              ["notifications.stat.mentions", stats.mentions, "var(--warning-amber)"],
              ["notifications.stat.system", stats.system, "var(--ink-tertiary)"],
              ["notifications.stat.digest", stats.digest, "var(--info-blue)"],
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
            <button className="btn btn-red" onClick={() => void onMarkAll()}>{t("notifications.btn.markAll")}</button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 48px 64px" }}>
          {live.loading && rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-tertiary)" }}>
              <div className="kicker" style={{ marginBottom: 8 }}>{t("notifications.loading")}</div>
            </div>
          ) : (
            SECTIONS.map((sec) => {
              const sectionRows = visible.filter((it) => it.section === sec);
              if (sectionRows.length === 0) return null;
              return (
                <div key={sec} style={{ marginBottom: 32 }}>
                  <div
                    className="rule-kicker"
                    style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 10, marginBottom: 12 }}
                  >
                    <span className="kicker-red">{t(`notifications.section.${sec}`)}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {sectionRows.map((it) => {
                      const actorLabel = t(`notifications.actor.${it.actor}`);
                      const kindLabel = t(`notifications.kind.${it.kind}`);
                      return (
                        <article
                          key={it.id}
                          className="paper-card"
                          style={{
                            padding: "14px 18px",
                            display: "grid",
                            gridTemplateColumns: "8px 130px 1fr 90px 170px",
                            gap: 14,
                            alignItems: "flex-start",
                            opacity: it.unread ? 1 : 0.72,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: it.unread ? "var(--accent-red)" : "transparent",
                              border: it.unread ? "none" : "1px solid var(--divider-strong)",
                              marginTop: 8,
                            }}
                          />
                          <div>
                            <div className="kicker" style={{ fontSize: 9, color: KIND_COLOR[it.kind] }}>
                              {actorLabel}
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
                              {kindLabel}
                            </div>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              className="font-serif"
                              style={{
                                fontSize: 15.5,
                                fontWeight: it.unread ? 600 : 500,
                                lineHeight: 1.35,
                                marginBottom: 4,
                                color: "var(--ink-primary)",
                              }}
                            >
                              {it.title}
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
                              {it.body}
                            </div>
                          </div>
                          <div className="kicker" style={{ fontSize: 10, textAlign: "right" }}>
                            {it.time}
                          </div>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                            {it.unread && (
                              <button
                                className="pill"
                                style={{ fontSize: 9, padding: "1px 6px" }}
                                onClick={() => void onRead(it)}
                                title={t("notifications.btn.markRead")}
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
                              onClick={() => void onRead(it)}
                            >
                              {t("notifications.btn.openSrc")}
                            </Link>
                            <button
                              className="pill"
                              style={{ fontSize: 9, padding: "1px 6px", color: "var(--ink-tertiary)" }}
                              onClick={() => void onDelete(it)}
                              title={t("notifications.btn.delete")}
                            >
                              ✕
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          {!live.loading && visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-tertiary)" }}>
              <div className="kicker" style={{ marginBottom: 8 }}>{t("notifications.empty")}</div>
              <div className="font-serif" style={{ fontSize: 18, fontStyle: "italic" }}>—</div>
            </div>
          )}

          {live.error && (
            <div style={{ marginTop: 16, padding: 12, border: "1px solid var(--accent-red)", color: "var(--accent-red)", fontSize: 12 }}>
              {live.error}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
