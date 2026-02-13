import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Create payment record (called from Dodo webhook)
 */
export const createPayment = internalMutation({
    args: {
        email: v.string(),
        dodoPaymentId: v.string(),
        amount: v.number(),
        currency: v.string(),
        dodoSubscriptionId: v.optional(v.string()),
        webhookPayload: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!user) throw new Error(`User not found with email: ${args.email}`);

        return await ctx.db.insert("payments", {
            userId: user._id,
            dodoPaymentId: args.dodoPaymentId,
            dodoSubscriptionId: args.dodoSubscriptionId,
            amount: args.amount,
            currency: args.currency,
            status: "succeeded",
            timestamp: Date.now(),
            webhookPayload: args.webhookPayload,
        });
    },
});
