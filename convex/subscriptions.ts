import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";

/**
 * Activate subscription (called from Dodo webhook)
 */
export const activate = internalMutation({
    args: {
        email: v.string(),
        dodoSubscriptionId: v.string(),
        planId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!user) throw new Error(`User not found with email: ${args.email}`);

        // Determine tier from plan ID
        const tier = args.planId.toLowerCase().includes("pro")
            ? "pro"
            : args.planId.toLowerCase().includes("enterprise")
                ? "enterprise"
                : "free";

        const allocation = tier === "pro" ? 1000 : tier === "enterprise" ? 10000 : 100;

        await ctx.db.patch(user._id, {
            subscriptionTier: tier,
            subscriptionStatus: "active",
            dodoSubscriptionId: args.dodoSubscriptionId,
            creditBalance: allocation,
            creditAllocation: allocation,
            subscriptionRenewsAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // +30 days
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Renew subscription (refresh tokens)
 */
export const renew = internalMutation({
    args: {
        subscriptionId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_dodo_subscription_id", (q) =>
                q.eq("dodoSubscriptionId", args.subscriptionId)
            )
            .unique();

        if (!user) throw new Error(`User not found with subscription: ${args.subscriptionId}`);

        await ctx.db.patch(user._id, {
            creditBalance: user.creditAllocation,
            subscriptionRenewsAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
            subscriptionStatus: "active",
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Put subscription on hold (failed payment)
 */
export const putOnHold = internalMutation({
    args: {
        subscriptionId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_dodo_subscription_id", (q) =>
                q.eq("dodoSubscriptionId", args.subscriptionId)
            )
            .unique();

        if (!user) throw new Error(`User not found with subscription: ${args.subscriptionId}`);

        await ctx.db.patch(user._id, {
            subscriptionStatus: "on_hold",
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Cancel subscription
 */
export const cancel = internalMutation({
    args: {
        subscriptionId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_dodo_subscription_id", (q) =>
                q.eq("dodoSubscriptionId", args.subscriptionId)
            )
            .unique();

        if (!user) throw new Error(`User not found with subscription: ${args.subscriptionId}`);

        await ctx.db.patch(user._id, {
            subscriptionStatus: "cancelled",
            subscriptionTier: "free",
            creditAllocation: 100,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});
