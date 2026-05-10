/**
 * AppLayout — the workspace chrome wrapping every authenticated page.
 *
 * 1:1 visual port of legacy js/shell.js → mountShell(). Layout:
 *
 *   ┌──────────┬───────────────────────────────────────┐
 *   │          │  TopBar (sticky)                      │
 *   │ Sidebar  ├───────────────────────────────────────┤
 *   │ (248px)  │  <main> children                       │
 *   │ sticky   │                                         │
 *   └──────────┴───────────────────────────────────────┘
 *
 * Server component by default — children may freely include client/server
 * components. The Sidebar + TopBar both call `useTranslations` (next-intl
 * supports it on both the server and client).
 */

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import type { NavItemId } from "./nav-config";

interface AppLayoutProps {
  activeId?: NavItemId;
  crumbKey?: string;
  crumb?: string;
  children: ReactNode;
}

export function AppLayout({ activeId, crumbKey, crumb, children }: AppLayoutProps) {
  return (
    <>
      <a href="#rt-main" className="skip-link">Skip to content</a>
      <div data-responsive="app" style={{ display: "block", minHeight: "100vh" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "248px 1fr",
            minHeight: "100vh",
          }}
        >
          <Sidebar activeId={activeId} />
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
    </>
  );
}
