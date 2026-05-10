"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "@/components/providers/toast";

export function BriefHeaderActionsClient({ PrintButton }: { PrintButton: ReactNode }) {
  const t = useTranslations();
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
      <button className="btn btn-red" onClick={() => toast(t("brief.alert.save"))}>
        {t("brief.btn.save")}
      </button>
      <button className="btn btn-ghost" onClick={() => toast(t("brief.alert.export"))}>
        {t("brief.btn.export")}
      </button>
      <button className="btn btn-ghost" onClick={() => toast(t("brief.alert.share"))}>
        {t("brief.btn.share")}
      </button>
      {PrintButton}
      <span style={{ flex: 1 }} />
      <Link
        href="/briefs"
        className="font-mono"
        style={{
          fontSize: 11,
          color: "var(--ink-tertiary)",
          textDecoration: "none",
          letterSpacing: ".1em",
          alignSelf: "center",
        }}
      >
        {t("brief.btn.library")}
      </Link>
    </div>
  );
}

export function BriefFollowupsClient() {
  const t = useTranslations();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      <Link
        href={`/ask?q=${encodeURIComponent(t("brief.fu.diagram.q"))}`}
        className="pill pill-red"
        style={{ textDecoration: "none" }}
      >
        {t("brief.fu.diagram")}
      </Link>
      <Link
        href={`/ask?q=${encodeURIComponent(t("brief.fu.reproduce.q"))}`}
        className="pill"
        style={{ textDecoration: "none" }}
      >
        {t("brief.fu.reproduce")}
      </Link>
      <Link
        href="/topic?t=llm-longctx&tab=evidence"
        className="pill"
        style={{ textDecoration: "none" }}
      >
        {t("brief.fu.viewEvi")}
      </Link>
      <Link
        href={`/ask?q=${encodeURIComponent(t("brief.fu.challenge.q"))}`}
        className="pill"
        style={{ textDecoration: "none" }}
      >
        {t("brief.fu.challenge")}
      </Link>
      <button className="pill" onClick={() => toast(t("brief.fu.alert.subscribe"))}>
        {t("brief.fu.subscribe")}
      </button>
    </div>
  );
}
