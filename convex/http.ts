import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { createDodoWebhookHandler } from "@dodopayments/convex";

const http = httpRouter();

/**
 * Dodo Payments Webhook Handler
 * Uses official @dodopayments/convex handler for automatic signature verification.
 */
const dodoWebhook = createDodoWebhookHandler({
    onSubscriptionActive: async (ctx, payload) => {
        console.log(`[Dodo Webhook] Subscription Active: ${payload.data.subscription_id}`);
        await ctx.runMutation(internal.subscriptions.activate, {
            email: payload.data.customer.email,
            dodoSubscriptionId: payload.data.subscription_id,
            planId: payload.data.product_id || "free",
        });
    },

    onSubscriptionRenewed: async (ctx, payload) => {
        console.log(`[Dodo Webhook] Subscription Renewed: ${payload.data.subscription_id}`);
        await ctx.runMutation(internal.subscriptions.renew, {
            subscriptionId: payload.data.subscription_id,
        });
    },

    onSubscriptionOnHold: async (ctx, payload) => {
        console.log(`[Dodo Webhook] Subscription On Hold: ${payload.data.subscription_id}`);
        await ctx.runMutation(internal.subscriptions.putOnHold, {
            subscriptionId: payload.data.subscription_id,
        });
    },

    onSubscriptionCancelled: async (ctx, payload) => {
        console.log(`[Dodo Webhook] Subscription Cancelled: ${payload.data.subscription_id}`);
        await ctx.runMutation(internal.subscriptions.cancel, {
            subscriptionId: payload.data.subscription_id,
        });
    },

    onPaymentSucceeded: async (ctx, payload) => {
        console.log(`[Dodo Webhook] Payment Succeeded: ${payload.data.payment_id}`);
        await ctx.runMutation(internal.payments.createPayment, {
            email: payload.data.customer.email,
            dodoPaymentId: payload.data.payment_id,
            amount: payload.data.total_amount,
            currency: payload.data.currency,
            dodoSubscriptionId: payload.data.subscription_id || undefined,
            webhookPayload: JSON.stringify(payload),
        });
    },
});

http.route({
    path: "/dodo-webhook",
    method: "POST",
    handler: dodoWebhook,
});

export default http;
