/**
 * Convex Client for Next.js Server Actions
 * Privacy-Compliant User Data Management
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
    console.error("[Convex] NEXT_PUBLIC_CONVEX_URL not configured");
}

const convex = new ConvexHttpClient(convexUrl!);

export { convex, api };

/**
 * Type Exports for Convex IDs
 */
export type ConvexUserId = Id<"users">;
export type ConvexScanId = Id<"scanHistory">;
export type ConvexPaymentId = Id<"payments">;
