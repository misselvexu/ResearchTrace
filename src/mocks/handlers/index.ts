/**
 * MSW handler registry — composes all 12 domain handler arrays into one.
 *
 * Order matters only insofar as overlapping route patterns are resolved
 * top-down. Our domains use disjoint path prefixes so order is informational.
 */

import { agentsHandlers } from "./agents";
import { askHandlers } from "./ask";
import { authHandlers } from "./auth";
import { billingHandlers } from "./billing";
import { briefsHandlers } from "./briefs";
import { claimsHandlers } from "./claims";
import { inboxHandlers } from "./inbox";
import { notificationsHandlers } from "./notifications";
import { sourcesHandlers } from "./sources";
import { topicsHandlers } from "./topics";
import { userHandlers } from "./user";
import { vaultHandlers } from "./vault";

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...billingHandlers,
  ...topicsHandlers,
  ...sourcesHandlers,
  ...vaultHandlers,
  ...inboxHandlers,
  ...notificationsHandlers,
  ...briefsHandlers,
  ...claimsHandlers,
  ...askHandlers,
  ...agentsHandlers,
];
