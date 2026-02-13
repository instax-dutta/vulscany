import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Create scan history entry (metadata only - NO source code)
 */
export const create = mutation({
    args: {
        userId: v.id("users"),
        repoName: v.string(),
        repoUrl: v.string(),
        scanType: v.union(v.literal("quick"), v.literal("deep"), v.literal("batch")),
        vulnerabilitiesFound: v.number(),
        criticalCount: v.number(),
        highCount: v.number(),
        mediumCount: v.number(),
        lowCount: v.number(),
        creditsConsumed: v.number(),
        scanDurationMs: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("scanHistory", {
            ...args,
            timestamp: Date.now(),
        });
    },
});
