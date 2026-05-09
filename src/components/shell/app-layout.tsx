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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar activeId={activeId} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <TopBar crumbKey={crumbKey} crumb={crumb} />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
