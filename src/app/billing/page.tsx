"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type InvoiceStatus = "paid" | "pending" | "refunded";

const INVOICES: { k: string; status: InvoiceStatus }[] = [
  { k: "1", status: "paid" },
  { k: "2", status: "paid" },
  { k: "3", status: "paid" },
  { k: "4", status: "paid" },
  { k: "5", status: "paid" },
  { k: "6", status: "paid" },
];

const USAGE_KEYS = ["ingest", "claims", "ask", "storage"] as const;
type UsageKey = (typeof USAGE_KEYS)[number];

const COMPARE_ROWS: { row: string; free: string; pro: string; team: string }[] = [
  { row: "topics", free: "topicsFree", pro: "topicsPro", team: "topicsTeam" },
  { row: "ask", free: "askFree", pro: "askPro", team: "askTeam" },
  { row: "storage", free: "storageFree", pro: "storagePro", team: "storageTeam" },
  { row: "agents", free: "agentsFree", pro: "agentsPro", team: "agentsTeam" },
  { row: "support", free: "supportFree", pro: "supportPro", team: "supportTeam" },
];

function statusColor(s: InvoiceStatus) {
  if (s === "paid") return "var(--success-green)";
  if (s === "pending") return "var(--warning-amber)";
  return "var(--ink-tertiary)";
}

export default function BillingPage() {
  const t = useTranslations();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    if (cancelling) return;
    if (confirm(t("billing.alert.cancel"))) {
      setCancelling(true);
      toast(t("billing.alert.cancelConfirmed"));
    }
  };

  // Pull usage values from i18n (each item has n + limit + k + v)
  const usageItems = USAGE_KEYS.map((k: UsageKey) => {
    const raw = t.raw(`billing.usage.items.${k}`) as { k: string; v: string; n: number; limit: number };
    return { key: k, ...raw };
  });

  return (
    <AppLayout activeId="billing" crumbKey="billing.crumb">
      {/* Masthead */}
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 48px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("billing.kicker")}</div>
              <h1 className="headline" style={{ fontSize: 44, margin: 0 }}>{t("billing.title")}</h1>
              <p
                className="font-serif"
                style={{ fontStyle: "italic", color: "var(--ink-secondary)", margin: "6px 0 0", fontSize: 15.5, maxWidth: 720 }}
                dangerouslySetInnerHTML={{ __html: t.raw("billing.lede.html") as string }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                className="watermark-number"
                style={{ fontSize: 88, color: "var(--accent-red)", opacity: 0.18, fontFamily: "var(--font-serif)" }}
              >
                {t("billing.watermark")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body — 2-col layout: plan card + usage on the left, payment/invoice on the right */}
      <section>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 48px 64px" }}>
          {/* Top row: Plan card + Payment method */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 32 }}>
            {/* Plan card */}
            <article
              className="paper-card"
              style={{
                padding: "26px 28px",
                background: "var(--bg-sidebar)",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="kicker-red" style={{ color: "var(--accent-red-soft)", marginBottom: 10 }}>
                {t("billing.plan.kicker")}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
                <h2
                  className="font-serif"
                  style={{ fontSize: 32, fontWeight: 700, margin: 0, color: "#fff" }}
                >
                  {t("billing.plan.name")}
                </h2>
                <span className="font-serif" style={{ fontSize: 26, fontWeight: 600, color: "var(--accent-red-soft)" }}>
                  {t("billing.plan.price")}
                </span>
                <span className="kicker" style={{ color: "var(--ink-mute-on-dark)" }}>
                  {t("billing.plan.per")}
                </span>
              </div>
              <div
                className="font-serif"
                style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-mute-on-dark)", marginBottom: 4 }}
              >
                {t("billing.plan.since")}
              </div>
              <div className="kicker" style={{ color: "var(--ink-mute-on-dark)", marginBottom: 18 }}>
                {t("billing.plan.renew")}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="btn btn-red"
                  onClick={() => toast(t("billing.alert.upgrade"))}
                >
                  {t("billing.plan.btnUpgrade")}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ borderColor: "var(--rule-on-dark)", color: "#fff" }}
                  onClick={() => toast(t("billing.alert.downloadInvoice"))}
                >
                  {t("billing.plan.btnInvoice")}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{
                    borderColor: "var(--rule-on-dark)",
                    color: cancelling ? "var(--ink-mute-on-dark)" : "#fff",
                    opacity: cancelling ? 0.6 : 1,
                  }}
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {t("billing.plan.btnCancel")}
                </button>
              </div>
              <div
                className="watermark-number"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 12,
                  right: 18,
                  fontSize: 130,
                  color: "var(--accent-red-soft)",
                  opacity: 0.16,
                  fontWeight: 700,
                  lineHeight: 0.9,
                  letterSpacing: -2,
                }}
              >
                {t("billing.watermark")}
              </div>
            </article>

            {/* Payment method */}
            <article className="paper-card" style={{ padding: "22px 24px" }}>
              <div className="kicker-red" style={{ marginBottom: 10 }}>{t("billing.method.kicker")}</div>
              <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px" }}>
                {t("billing.method.headline")}
              </h3>
              <div
                style={{
                  border: "1px solid var(--divider-strong)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 12,
                  background: "var(--bg-paper-warm)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 30,
                    background: "var(--ink-primary)",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  VISA
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-serif" style={{ fontSize: 14, fontWeight: 600 }}>
                    {t("billing.method.card")}
                  </div>
                  <div className="kicker" style={{ fontSize: 10, marginTop: 2 }}>
                    {t("billing.method.expires")}
                  </div>
                </div>
              </div>
              <div
                className="font-serif"
                style={{
                  fontSize: 12.5,
                  fontStyle: "italic",
                  color: "var(--accent-red)",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                ⚠ {t("billing.method.warn")}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-red"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => toast(t("billing.alert.updateMethod"))}
                >
                  {t("billing.method.btnUpdate")}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => toast(t("billing.alert.addMethod"))}
                >
                  {t("billing.method.btnAdd")}
                </button>
              </div>
            </article>
          </div>

          {/* Usage section */}
          <div style={{ marginBottom: 32 }}>
            <div
              className="rule-kicker"
              style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
            >
              <span className="kicker-red">{t("billing.usage.kicker")}</span>
              <span className="kicker" style={{ fontSize: 10 }}>{t("billing.usage.lede")}</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 18px" }}>
              {t("billing.usage.headline")}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {usageItems.map((u) => {
                const isUnlimited = u.limit === 0;
                const pct = isUnlimited ? 0 : Math.min(100, Math.round((u.n / u.limit) * 100));
                const overWarn = !isUnlimited && pct >= 80;
                return (
                  <div
                    key={u.key}
                    className="paper-card"
                    style={{ padding: "16px 20px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <div className="kicker">{u.k}</div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: 12,
                          color: overWarn ? "var(--accent-red)" : "var(--ink-secondary)",
                        }}
                      >
                        {u.v}
                      </div>
                    </div>
                    {isUnlimited ? (
                      <div
                        style={{
                          height: 6,
                          background: "var(--divider)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "repeating-linear-gradient(45deg, var(--success-green) 0 6px, transparent 6px 12px)",
                            opacity: 0.45,
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 6,
                          background: "var(--divider)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: overWarn ? "var(--accent-red)" : "var(--accent-red-soft)",
                          }}
                        />
                      </div>
                    )}
                    <div
                      className="font-serif"
                      style={{
                        fontSize: 11,
                        fontStyle: "italic",
                        color: "var(--ink-tertiary)",
                        marginTop: 6,
                      }}
                    >
                      {isUnlimited ? "∞ unlimited on PRO" : `${pct}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan compare */}
          <div style={{ marginBottom: 32 }}>
            <div
              className="rule-kicker"
              style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 12, marginBottom: 14 }}
            >
              <span className="kicker-red">{t("billing.compare.kicker")}</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 18px" }}>
              {t("billing.compare.headline")}
            </h2>
            <div
              className="paper-card"
              style={{ padding: 0, overflow: "hidden", borderColor: "var(--divider-strong)" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr 1fr 1fr",
                  borderBottom: "1px solid var(--divider-strong)",
                  background: "var(--bg-paper-warm)",
                }}
              >
                <div style={{ padding: "14px 18px" }} />
                {(["free", "pro", "team"] as const).map((p) => (
                  <div
                    key={p}
                    style={{
                      padding: "14px 18px",
                      borderLeft: "1px solid var(--divider-strong)",
                      background: p === "pro" ? "var(--accent-red-soft)" : undefined,
                    }}
                  >
                    <div
                      className="kicker-red"
                      style={{ marginBottom: 4, color: p === "pro" ? "var(--accent-red)" : "var(--ink-tertiary)" }}
                    >
                      {t(`billing.compare.${p}.name`)}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span className="font-serif" style={{ fontSize: 22, fontWeight: 700 }}>
                        {t(`billing.compare.${p}.price`)}
                      </span>
                      <span className="kicker">{t(`billing.compare.${p}.per`)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {COMPARE_ROWS.map((r, idx) => (
                <div
                  key={r.row}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr 1fr 1fr",
                    borderBottom: idx === COMPARE_ROWS.length - 1 ? undefined : "1px dotted var(--divider-strong)",
                  }}
                >
                  <div className="kicker" style={{ padding: "12px 18px" }}>
                    {t(`billing.compare.row.${r.row}`)}
                  </div>
                  {(["free", "pro", "team"] as const).map((p) => (
                    <div
                      key={p}
                      className="font-serif"
                      style={{
                        padding: "12px 18px",
                        borderLeft: "1px solid var(--divider)",
                        fontSize: 14,
                        background: p === "pro" ? "rgba(213, 60, 60, 0.04)" : undefined,
                        fontWeight: p === "pro" ? 600 : 500,
                      }}
                    >
                      {t(`billing.compare.v.${r[p]}`)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div>
            <div
              className="rule-kicker"
              style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 12, marginBottom: 14 }}
            >
              <span className="kicker-red">{t("billing.invoice.kicker")}</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 14px" }}>
              {t("billing.invoice.headline")}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr 110px 110px 200px",
                gap: 12,
                padding: "0 18px 10px",
                borderBottom: "1px solid var(--divider-strong)",
              }}
            >
              <span className="kicker" style={{ fontSize: 9 }}>{t("billing.invoice.col.date")}</span>
              <span className="kicker" style={{ fontSize: 9 }}>{t("billing.invoice.col.no")}</span>
              <span className="kicker" style={{ fontSize: 9, textAlign: "right" }}>{t("billing.invoice.col.amount")}</span>
              <span className="kicker" style={{ fontSize: 9 }}>{t("billing.invoice.col.status")}</span>
              <span className="kicker" style={{ fontSize: 9 }}>{t("billing.invoice.col.action")}</span>
            </div>
            {INVOICES.map((inv) => {
              const date = t(`billing.invoice.row.${inv.k}.date`);
              const no = t(`billing.invoice.row.${inv.k}.no`);
              const amount = t(`billing.invoice.row.${inv.k}.amount`);
              return (
                <article
                  key={inv.k}
                  className="paper-card"
                  style={{
                    padding: "12px 18px",
                    marginTop: 6,
                    display: "grid",
                    gridTemplateColumns: "130px 1fr 110px 110px 200px",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div className="font-mono" style={{ fontSize: 12 }}>{date}</div>
                  <div className="font-serif" style={{ fontSize: 14, fontWeight: 500 }}>{no}</div>
                  <div className="font-serif" style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>
                    {amount}
                  </div>
                  <span
                    className="pill"
                    style={{
                      fontSize: 9,
                      color: statusColor(inv.status),
                      borderColor: "currentColor",
                      justifySelf: "start",
                    }}
                  >
                    {inv.status === "paid" ? "✓ " : inv.status === "pending" ? "⏳ " : "↺ "}
                    {t(`billing.invoice.status.${inv.status}`)}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="pill"
                      style={{ fontSize: 9, padding: "1px 6px" }}
                      onClick={() => toast(t("billing.alert.viewInvoice"))}
                    >
                      {t("billing.invoice.act.view")}
                    </button>
                    <button
                      className="pill"
                      style={{
                        fontSize: 9,
                        padding: "1px 6px",
                        color: "var(--accent-red)",
                        borderColor: "currentColor",
                      }}
                      onClick={() => toast(t("billing.alert.downloadInvoice"))}
                    >
                      {t("billing.invoice.act.download")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
