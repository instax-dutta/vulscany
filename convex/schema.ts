import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // User Accounts
    users: defineTable({
        githubId: v.number(),
        email: v.string(),
        name: v.string(),
        avatarUrl: v.optional(v.string()),

        // Credit Management
        creditBalance: v.number(),
        creditAllocation: v.number(),

        // Subscription
        subscriptionTier: v.union(
            v.literal("free"),
            v.literal("pro"),
            v.literal("enterprise")
        ),
        subscriptionStatus: v.union(
            v.literal("active"),
            v.literal("on_hold"),
            v.literal("cancelled"),
            v.literal("expired")
        ),
        dodoCustomerId: v.optional(v.string()),
        dodoSubscriptionId: v.optional(v.string()),
        subscriptionRenewsAt: v.optional(v.number()),

        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
        lastScanAt: v.optional(v.number()),
    })
        .index("by_github_id", ["githubId"])
        .index("by_email", ["email"])
        .index("by_dodo_customer_id", ["dodoCustomerId"])
        .index("by_dodo_subscription_id", ["dodoSubscriptionId"]),

    // Credit Usage Tracking
    creditUsage: defineTable({
        userId: v.id("users"),
        amount: v.number(),
        operation: v.string(),
        repoName: v.optional(v.string()),
        billingPeriod: v.string(),
        timestamp: v.number(),
    })
        .index("by_user_and_period", ["userId", "billingPeriod"])
        .index("by_user_and_timestamp", ["userId", "timestamp"]),

    // Scan History (Metadata Only - NO SOURCE CODE)
    scanHistory: defineTable({
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
        timestamp: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_timestamp", ["userId", "timestamp"]),

    // Payment Events (from Dodo Webhooks)
    payments: defineTable({
        userId: v.id("users"),
        dodoPaymentId: v.string(),
        dodoSubscriptionId: v.optional(v.string()),
        amount: v.number(),
        currency: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("succeeded"),
            v.literal("failed")
        ),
        timestamp: v.number(),
        webhookPayload: v.optional(v.string()),
    })
        .index("by_user", ["userId"])
        .index("by_dodo_payment_id", ["dodoPaymentId"]),
});
