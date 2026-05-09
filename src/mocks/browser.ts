/**
 * MSW — browser worker bootstrap.
 *
 * Wires the in-browser Service Worker that intercepts fetch() calls during
 * development. Activated only when NEXT_PUBLIC_API_MOCKING === "enabled".
 *
 * Usage (client component, root layout):
 *   if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
 *     const { worker } = await import("@/mocks/browser");
 *     await worker.start({ onUnhandledRequest: "bypass" });
 *   }
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
