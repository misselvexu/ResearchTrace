"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/shell/app-layout";
import { toast } from "@/components/providers/toast";

type SuggestionKey = "today" | "briefs" | "topics" | "ask";

const SUGGESTIONS: { key: SuggestionKey; href: string }[] = [
  { key: "today", href: "/today" },
  { key: "briefs", href: "/briefs" },
  { key: "topics", href: "/topics" },
  { key: "ask", href: "/ask" },
];

export default function NotFoundPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <AppLayout crumbKey="notFound.crumb">
      <section style={{ borderBottom: "1px solid var(--divider)" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "64px 48px 48px",
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div className="kicker-red" style={{ marginBottom: 14 }}>
              {t("notFound.kicker")}
            </div>
            <h1
              className="headline"
              style={{ fontSize: 56, lineHeight: 1.05, margin: "0 0 16px" }}
            >
              {t("notFound.title")}
            </h1>
            <p
              className="font-serif"
              style={{
                fontSize: 18,
                fontStyle: "italic",
                lineHeight: 1.55,
                color: "var(--ink-secondary)",
                margin: "0 0 28px",
                maxWidth: 620,
              }}
            >
              {t("notFound.lede")}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.back()}
              >
                {t("notFound.btn.back")}
              </button>
              <Link href="/today" className="btn btn-red">
                {t("notFound.btn.today")}
              </Link>
              <button
                type="button"
                className="pill"
                onClick={() => toast(t("notFound.report.alert"))}
              >
                {t("notFound.btn.report")}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              className="watermark-number"
              style={{ fontSize: 220, lineHeight: 0.9, color: "var(--accent-red)" }}
            >
              {t("notFound.watermark")}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 48px 64px" }}>
          <div className="rule-kicker">
            <span className="kicker-red">{t("notFound.suggestion._value")}</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 14,
              marginTop: 16,
            }}
          >
            {SUGGESTIONS.map((s, i) => (
              <Link
                key={s.key}
                href={s.href}
                className="paper-card clickable"
                style={{
                  display: "grid",
                  gridTemplateColumns: "54px 1fr 24px",
                  gap: 16,
                  alignItems: "center",
                  padding: "18px 22px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  className="font-serif"
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--accent-red)",
                    lineHeight: 1,
                  }}
                >
                  0{i + 1}
                </div>
                <div
                  className="font-serif"
                  style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4 }}
                >
                  {t(`notFound.suggestion.${s.key}`)}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 14,
                    color: "var(--accent-red)",
                    textAlign: "right",
                  }}
                >
                  →
                </div>
              </Link>
            ))}
          </div>

          <div
            className="kicker"
            style={{
              marginTop: 36,
              paddingTop: 18,
              borderTop: "1px solid var(--divider)",
              fontSize: 10,
              color: "var(--ink-tertiary)",
            }}
          >
            {t("notFound.colophon")}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
