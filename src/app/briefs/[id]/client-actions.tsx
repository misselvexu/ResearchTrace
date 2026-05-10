"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/components/providers/toast";
import {
  useBriefLive,
  saveBriefToVault,
  shareBrief,
  voteBrief,
  BriefMeta,
} from "./brief-data";

/**
 * Client island that fetches the live Brief by id and renders:
 *   - A small meta strip (status / reading time / cadence / vault flag)
 *   - The action buttons wired to the corresponding mutations
 *   - A feedback (👍/👎) row driven by `Brief.feedback`
 */
export function BriefHeaderActionsClient({
  PrintButton,
  rawId,
}: {
  PrintButton: ReactNode;
  rawId: string;
}) {
  const t = useTranslations();
  const { brief } = useBriefLive(rawId);
  const [feedback, setFeedback] = useState(brief?.feedback ?? null);

  // Sync local feedback state with whatever the latest fetch produced.
  // (Cheap — runs only when the brief object identity changes.)
  if (brief && feedback === null) {
    setFeedback(brief.feedback);
  }

  const myVote = feedback?.myVote ?? brief?.feedback.myVote ?? null;
  const ups = feedback?.upvotes ?? brief?.feedback.upvotes ?? 0;
  const downs = feedback?.downvotes ?? brief?.feedback.downvotes ?? 0;

  return (
    <div>
      {/* Live meta strip */}
      {brief && (
        <div style={{ marginTop: 14 }}>
          <BriefMeta brief={brief} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
        <button
          className="btn btn-red"
          onClick={() => void saveBriefToVault(brief, t)}
          disabled={brief?.savedToVault}
          style={{ opacity: brief?.savedToVault ? 0.6 : 1 }}
        >
          {brief?.savedToVault ? `✓ ${t("brief.btn.save")}` : t("brief.btn.save")}
        </button>
        <button className="btn btn-ghost" onClick={() => toast(t("brief.alert.export"))}>
          {t("brief.btn.export")}
        </button>
        <button className="btn btn-ghost" onClick={() => void shareBrief(brief, t)}>
          {t("brief.btn.share")}
        </button>
        {PrintButton}

        {/* Feedback (only when we have a live brief) */}
        {brief && (
          <span
            style={{
              display: "inline-flex",
              gap: 4,
              alignItems: "center",
              marginLeft: 8,
            }}
          >
            <button
              className={`pill ${myVote === "up" ? "is-active" : ""}`}
              style={{ fontSize: 11, padding: "2px 10px" }}
              onClick={async () => {
                const res = await voteBrief(
                  brief,
                  myVote === "up" ? null : "up",
                  t,
                );
                if (res) setFeedback(res);
              }}
              aria-label="Upvote"
            >
              👍 {ups}
            </button>
            <button
              className={`pill ${myVote === "down" ? "is-active" : ""}`}
              style={{ fontSize: 11, padding: "2px 10px" }}
              onClick={async () => {
                const res = await voteBrief(
                  brief,
                  myVote === "down" ? null : "down",
                  t,
                );
                if (res) setFeedback(res);
              }}
              aria-label="Downvote"
            >
              👎 {downs}
            </button>
          </span>
        )}

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
        {t("brief.fu.diagram._value")}
      </Link>
      <Link
        href={`/ask?q=${encodeURIComponent(t("brief.fu.reproduce.q"))}`}
        className="pill"
        style={{ textDecoration: "none" }}
      >
        {t("brief.fu.reproduce._value")}
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
        {t("brief.fu.challenge._value")}
      </Link>
      <button className="pill" onClick={() => toast(t("brief.fu.alert.subscribe"))}>
        {t("brief.fu.subscribe")}
      </button>
    </div>
  );
}
