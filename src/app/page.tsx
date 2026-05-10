"use client";

/**
 * Root route — branches by client-side auth state.
 *
 *   - Anonymous visitors  → /landing  (public marketing page)
 *   - Signed-in visitors  → /today    (workspace digest)
 *
 * The redirect runs on the client because the auth flag lives in
 * localStorage (see @/lib/auth). Server-side rendering paints a tiny
 * loading state to avoid layout flash.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthed() ? "/today" : "/landing");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-paper)",
        color: "var(--ink-tertiary)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      <span aria-live="polite">RESEARCHTRACE · LOADING…</span>
    </div>
  );
}
