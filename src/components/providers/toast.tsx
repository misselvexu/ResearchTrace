"use client";

/**
 * Lightweight global toast system — replaces alert() across the app.
 *
 * Usage:
 *   import { toast } from "@/components/providers/toast";
 *   toast("Saved");
 *   toast.success("Saved as card");
 *   toast.info("Hint: ...");
 *
 * The <ToastHost /> must be mounted once at the root layout.
 */

import { useEffect, useState } from "react";

type ToastTone = "default" | "success" | "info" | "warn" | "error";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

let _id = 0;
let _listeners: ((items: ToastItem[]) => void)[] = [];
let _items: ToastItem[] = [];

function _emit() {
  for (const l of _listeners) l(_items.slice());
}

function _push(message: string, tone: ToastTone = "default", duration = 2600) {
  if (typeof window === "undefined") return;
  const id = ++_id;
  _items = [..._items, { id, message, tone }];
  _emit();
  window.setTimeout(() => {
    _items = _items.filter((t) => t.id !== id);
    _emit();
  }, duration);
}

type ToastFn = ((message: string) => void) & {
  success: (m: string) => void;
  info: (m: string) => void;
  warn: (m: string) => void;
  error: (m: string) => void;
};

const _toast = ((message: string) => _push(message, "default")) as ToastFn;
_toast.success = (m: string) => _push(m, "success");
_toast.info = (m: string) => _push(m, "info");
_toast.warn = (m: string) => _push(m, "warn");
_toast.error = (m: string) => _push(m, "error", 3600);

export const toast = _toast;

const TONE_STYLE: Record<ToastTone, { bg: string; border: string; fg: string; mark: string }> = {
  default: {
    bg: "var(--bg-card)",
    border: "var(--divider-strong)",
    fg: "var(--ink-primary)",
    mark: "var(--ink-primary)",
  },
  success: {
    bg: "color-mix(in oklab, var(--success-green) 12%, var(--bg-card))",
    border: "color-mix(in oklab, var(--success-green) 35%, var(--divider-strong))",
    fg: "var(--ink-primary)",
    mark: "var(--success-green)",
  },
  info: {
    bg: "color-mix(in oklab, var(--info-blue) 12%, var(--bg-card))",
    border: "color-mix(in oklab, var(--info-blue) 35%, var(--divider-strong))",
    fg: "var(--ink-primary)",
    mark: "var(--info-blue)",
  },
  warn: {
    bg: "color-mix(in oklab, var(--warning-amber) 14%, var(--bg-card))",
    border: "color-mix(in oklab, var(--warning-amber) 40%, var(--divider-strong))",
    fg: "var(--ink-primary)",
    mark: "var(--warning-amber)",
  },
  error: {
    bg: "color-mix(in oklab, var(--accent-red) 14%, var(--bg-card))",
    border: "color-mix(in oklab, var(--accent-red) 40%, var(--divider-strong))",
    fg: "var(--ink-primary)",
    mark: "var(--accent-red)",
  },
};

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const sub = (next: ToastItem[]) => setItems(next);
    _listeners.push(sub);
    return () => {
      _listeners = _listeners.filter((l) => l !== sub);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 360,
        pointerEvents: "none",
      }}
    >
      {items.map((it) => {
        const tone = TONE_STYLE[it.tone];
        return (
          <div
            key={it.id}
            role={it.tone === "error" ? "alert" : "status"}
            style={{
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              borderLeft: `3px solid ${tone.mark}`,
              color: tone.fg,
              padding: "12px 16px",
              fontFamily: "var(--font-serif)",
              fontSize: 14,
              lineHeight: 1.5,
              boxShadow: "0 8px 24px -10px rgba(0,0,0,0.15)",
              animation: "rt-toast-in 220ms ease-out",
              pointerEvents: "auto",
              maxWidth: 360,
            }}
          >
            {it.message}
          </div>
        );
      })}
      <style>{`
        @keyframes rt-toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
