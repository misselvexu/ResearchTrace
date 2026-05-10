"use client";

/**
 * AuthGate — wrap a workspace page; if no session, redirect to /login
 * with `?next=<encoded-path>` so we can return after sign-in.
 *
 * Renders a tiny mono "loading…" placeholder during the auth check
 * (one tick) to avoid a flash of unauthorised UI.
 */

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isAuthed } from "@/lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthed()) {
      setReady(true);
      return;
    }
    const here = pathname + (search?.toString() ? `?${search.toString()}` : "");
    router.replace(`/login?next=${encodeURIComponent(here)}`);
  }, [router, pathname, search]);

  if (!ready) {
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
        <span aria-live="polite">CHECKING SESSION…</span>
      </div>
    );
  }
  return <>{children}</>;
}
