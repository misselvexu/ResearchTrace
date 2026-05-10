"use client";

/**
 * MswProvider — boots the MSW browser worker exactly once on the client.
 *
 * Activation rule: only if `process.env.NEXT_PUBLIC_API_MOCKING === "enabled"`.
 *   - In real production deployments the env var is unset → this is a no-op.
 *   - In `pnpm dev:mock` / `pnpm build:mock` we flip it on so every page
 *     transparently runs against the mock backend.
 *
 * While the worker is starting up, children render normally — fetches that
 * race the boot will fall through to the real network and fail with
 * `ServiceUnavailable`. To avoid that on first paint we gate children on a
 * `ready` flag during boot in mock mode only. In real mode children render
 * immediately.
 *
 * This component intentionally has no UI of its own.
 */

import { useEffect, useState, type ReactNode } from "react";

const MOCK_ENABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

let bootPromise: Promise<void> | null = null;

async function boot(): Promise<void> {
  if (typeof window === "undefined") return;
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    const { worker } = await import("@/mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
      quiet: true,
    });
  })();
  return bootPromise;
}

export function MswProvider({ children }: { children: ReactNode }) {
  // In real (non-mock) mode, render synchronously — no waiting, no flicker.
  const [ready, setReady] = useState<boolean>(!MOCK_ENABLED);

  useEffect(() => {
    if (!MOCK_ENABLED) return;
    let cancelled = false;
    boot()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        // If the worker fails to boot, log and let the app continue —
        // page-level error states will surface the network failure.
        // eslint-disable-next-line no-console
        console.error("[MSW] worker failed to start:", err);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    // Subtle placeholder while the worker spins up (typically <100ms).
    return (
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          background: "var(--bg-paper, #fffaf3)",
          color: "var(--ink-tertiary, #999)",
          fontFamily: "var(--font-mono, ui-monospace)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          zIndex: 9999,
        }}
      >
        Booting mock backend…
      </div>
    );
  }

  return <>{children}</>;
}
