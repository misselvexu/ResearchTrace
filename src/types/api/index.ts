/**
 * ResearchTrace API — barrel export.
 *
 * Import from this module rather than reaching into individual domain files
 * so that the contract surface stays curated and refactor-friendly.
 *
 *   import type { Topic, ApiResponse, LocalizedText } from "@/types/api";
 */

// Shared / foundational types — used by every domain.
export * from "./_shared";

// Account & billing
export * from "./auth";
export * from "./user";
export * from "./billing";

// Content
export * from "./topics";
export * from "./sources";
export * from "./vault";

// Messaging
export * from "./inbox";
export * from "./notifications";

// Intelligence
export * from "./briefs";
export * from "./claims";
export * from "./ask";
export * from "./agents";
