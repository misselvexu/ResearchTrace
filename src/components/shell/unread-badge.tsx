"use client";

/**
 * UnreadBadge — live counter for the TopBar inbox bell.
 *
 * Replaces the hard-coded "47" badge. Calls `GET /notifications/unread-count`
 * on mount, then polls every 60 s. The endpoint is intercepted by MSW in
 * dev/mock mode and returns `{ unread, topSeverity }` (see B8 mocks).
 *
 * Failure mode: silently hide the badge (returns null). We don't surface
 * polling errors via toast — the badge is ambient, not actionable.
 *
 * Color coding follows `NotificationSeverity`:
 *   - critical → accent-red (default)
 *   - warning  → warning-amber
 *   - info / success / null → accent-red (visual parity with legacy)
 */

import { useEffect, useState } from "react";
import { api, isApiError } from "@/lib/api";
import type { UnreadCountResponse, NotificationSeverity } from "@/types/api";

const POLL_MS = 60_000;
const MAX_DISPLAY = 99;

function severityColor(sev: NotificationSeverity | null): string {
  switch (sev) {
    case "warning":
      return "var(--warning-amber)";
    case "critical":
    case "info":
    case "success":
    case null:
    default:
      return "var(--accent-red)";
  }
}

export function UnreadBadge() {
  const [data, setData] = useState<UnreadCountResponse | null>(null);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    async function tick() {
      try {
        // Bypass the promise cache: this is a polling fetch and must always
        // hit the network so the badge stays fresh.
        const res = await api.get<UnreadCountResponse>(
          "/notifications/unread-count",
          undefined,
          ctrl.signal,
        );
        if (alive) setData(res);
      } catch (e) {
        // Abort on unmount is normal; everything else: silently retain last
        // known value (or null on first failure).
        if (isApiError(e) && e.status === 0) return;
        // No-op — keep previous count.
      }
    }

    void tick();
    const id = window.setInterval(() => void tick(), POLL_MS);

    return () => {
      alive = false;
      ctrl.abort();
      window.clearInterval(id);
    };
  }, []);

  // Render nothing while loading or when there's nothing unread.
  if (!data || data.unread <= 0) return null;

  const display = data.unread > MAX_DISPLAY ? `${MAX_DISPLAY}+` : String(data.unread);

  return (
    <span
      aria-label={`${data.unread} unread`}
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        background: severityColor(data.topSeverity),
        color: "#fff",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        padding: "1px 4px",
        borderRadius: 8,
        lineHeight: 1.4,
      }}
    >
      {display}
    </span>
  );
}
