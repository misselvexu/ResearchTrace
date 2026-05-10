/**
 * AppLayout — the workspace chrome wrapping every authenticated page.
 *
 * 1:1 visual port of legacy js/shell.js → mountShell(). Layout:
 *
 *   ┌──────────┬───────────────────────────────────────┐
 *   │          │  TopBar (sticky)                      │
 *   │ Sidebar  ├───────────────────────────────────────┤
 *   │ 64/248px │  <main> children                       │
 *   │ sticky   │                                         │
 *   └──────────┴───────────────────────────────────────┘
 *
 * The sidebar can be collapsed to 64px (icon-only) via the toggle button
 * anchored at the bottom of the rail, or via the `[` / `]` keyboard
 * shortcuts. State is persisted to `localStorage` and hydrated pre-paint by
 * the boot script in src/app/layout.tsx to avoid flicker.
 *
 * Children may freely include client/server components — this wrapper is
 * marked `"use client"` only because it owns the collapsed state, but
 * children are passed through transparently.
 */

"use client";

import { Suspense, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import type { NavItemId } from "./nav-config";
import { AuthGate } from "@/components/auth/auth-gate";
import { useSidebarCollapsed } from "@/lib/use-sidebar-collapsed";

interface AppLayoutProps {
  activeId?: NavItemId;
  crumbKey?: string;
  crumb?: string;
  children: ReactNode;
}

export function AppLayout({ activeId, crumbKey, crumb, children }: AppLayoutProps) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const railWidth = collapsed ? 64 : 248;

  return (
    <Suspense fallback={null}>
      <AuthGate>
        <a href="#rt-main" className="skip-link">Skip to content</a>
        <div data-responsive="app" style={{ display: "block", minHeight: "100vh" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${railWidth}px 1fr`,
              minHeight: "100vh",
              transition: "grid-template-columns 180ms ease",
            }}
          >
            <Sidebar
              activeId={activeId}
              collapsed={collapsed}
              onToggle={toggle}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <TopBar crumbKey={crumbKey} crumb={crumb} />
              <main id="rt-main" className="rt-main" data-rt-main style={{ flex: 1 }}>
                {children}
              </main>
            </div>
          </div>
        </div>
      </AuthGate>
    </Suspense>
  );
}
