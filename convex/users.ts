import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Upsert user from GitHub OAuth callback
 */
export const upsertUser = mutation({
    args: {
        githubId: v.number(),
        email: v.string(),
        name: v.string(),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                avatarUrl: args.avatarUrl,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        // New user: Grant free tier credits
        return await ctx.db.insert("users", {
            ...args,
            creditBalance: 100,
            creditAllocation: 100,
            subscriptionTier: "free",
            subscriptionStatus: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

/**
 * Get user by Convex ID
 */
export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

/**
 * Get user by GitHub ID
 */
export const getByGithubId = query({
    args: { githubId: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
            .unique();
    },
});

/**
 * Deduct credits (pre-scan validation)
 */
export const deductCredits = mutation({
    args: {
        userId: v.id("users"),
        amount: v.number(),
        operation: v.string(),
        repoName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        if (user.creditBalance < args.amount) {
            throw new Error(`Insufficient credits. Required: ${args.amount}, Available: ${user.creditBalance}`);
        }

        // Deduct credits
        await ctx.db.patch(args.userId, {
            creditBalance: user.creditBalance - args.amount,
            lastScanAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Log credit usage
        const billingPeriod = new Date().toISOString().slice(0, 7); // "2026-02"
        await ctx.db.insert("creditUsage", {
            userId: args.userId,
            amount: args.amount,
            operation: args.operation,
            repoName: args.repoName,
            billingPeriod,
            timestamp: Date.now(),
        });

        return user.creditBalance - args.amount; // Return new balance
    },
});

/**
 * Export all user data (GDPR Article 20 - Data Portability)
 */
export const exportUserData = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const usage = await ctx.db
            .query("creditUsage")
            .withIndex("by_user_and_timestamp", (q) => q.eq("userId", args.userId))
            .collect();

        const scans = await ctx.db
            .query("scanHistory")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const payments = await ctx.db
            .query("payments")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        return {
            user,
            creditUsage: usage,
            scanHistory: scans,
            payments,
            exportedAt: Date.now(),
        };
    },
});
