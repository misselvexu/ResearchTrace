/**
 * MSW — Node server bootstrap.
 *
 * Used by Vitest / Jest tests and any Node-side request interception
 * (e.g. SSR routes during local dev). Browser code uses ./browser.ts instead.
 *
 * Usage (test setup):
 *   import { server } from "@/mocks/server";
 *   beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
