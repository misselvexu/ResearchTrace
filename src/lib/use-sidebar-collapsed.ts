/**
 * useSidebarCollapsed — persisted [collapsed, toggle, set] for the workspace
 * sidebar.
 *
 * Persistence: localStorage["rt.sidebar.collapsed"] = "1" | "0".
 *
 * SSR-safety: state starts `false` on the server (matches the inline boot
 * script default). The boot script in <head> writes `data-sidebar-collapsed`
 * on the <html> element BEFORE first paint to avoid a flicker frame; this
 * hook reads from that attribute on mount and then keeps it in sync.
 */

"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rt.sidebar.collapsed";
const ATTR = "data-sidebar-collapsed";

function readInitial(): boolean {
  if (typeof document === "undefined") return false;
  // Prefer the html attribute set by the inline boot script (faster + avoids
  // localStorage read on every component mount).
  const attr = document.documentElement.getAttribute(ATTR);
  if (attr === "1") return true;
  if (attr === "0") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useSidebarCollapsed(): {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
} {
  const [collapsed, setCollapsedState] = useState<boolean>(false);

  // Hydrate from <html data-sidebar-collapsed> / localStorage on mount.
  useEffect(() => {
    setCollapsedState(readInitial());
  }, []);

  // Persist + reflect to <html> + emit a custom event so other components
  // (e.g. the topbar) can react if they want.
  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      /* ignore quota / private-mode errors */
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(ATTR, v ? "1" : "0");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("rt:sidebar-collapsed", { detail: { collapsed: v } }),
      );
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  // Keyboard shortcut: `[` collapse, `]` expand. Skips when typing in
  // inputs/textareas/contenteditable to avoid stealing user input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tgt = e.target as HTMLElement | null;
      if (tgt) {
        const tag = tgt.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tgt.isContentEditable) {
          return;
        }
      }
      if (e.key === "[") {
        setCollapsed(true);
      } else if (e.key === "]") {
        setCollapsed(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCollapsed]);

  return { collapsed, toggle, setCollapsed };
}
