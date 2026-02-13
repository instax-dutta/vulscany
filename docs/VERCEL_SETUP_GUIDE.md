# 🛠️ Vercel Deployment & Credentials Guide

This guide explains how to obtain the necessary credentials to activate **Convex DB** and **Dodo Payments** for your Vercel deployment.

---

## 1. Convex DB Credentials
Convex handles your database and token logic.

### Steps to get credentials:
1.  **Initialize locally**: 
    If you haven't already, run `npx convex dev` in your project folder. This will prompt you to log in or create an account.
2.  **Get the Deployment URL**:
    Visit your **[Convex Dashboard](https://dashboard.convex.dev)**.
    *   Select your project.
    *   Go to **Settings** → **Deployment Settings**.
    *   Copy the **Deployment URL**.
3.  **Vercel Variables**:
    Add the following to your Vercel Project Settings (Environment Variables):
    *   `CONVEX_DEPLOYMENT`: Found in the `process.env` Section of the dashboard (looks like `production:xxx-xxx-123`).
    *   `NEXT_PUBLIC_CONVEX_URL`: Your Deployment URL (e.g., `https://smiling-penguin-123.convex.cloud`).
    *   `CONVEX_DEPLOY_KEY`: (CRITICAL) Go to **Settings** → **Deploy Key**. Generate a new key. This allows the Vercel build to run `npx convex codegen`.

---

## 2. Dodo Payments Credentials
Dodo Payments handles global checkout and Indian UPI payments.

### Steps to get credentials:
1.  **Dashboard**: Sign up at **[Dodo Payments](https://dashboard.dodopayments.com)**.
2.  **API Keys**:
    *   Go to **Developer Settings** → **API Keys**.
    *   **Secret Key**: Click "Generate Secret Key" (Starts with `test_sk_` or `live_sk_`). This is your `DODO_API_KEY`.
    *   **Public Key**: Copy the Publishable Key (Starts with `test_pk_` or `live_pk_`). This is your `NEXT_PUBLIC_DODO_PUBLIC_KEY`.
3.  **Webhook Secret**:
    *   Go to **Webhooks** → **Add Endpoint**.
    *   **URL**: Enter `https://your-vercel-domain.com/api/payments/webhook` (or your Convex Http URL: `https://your-convex-app.convex.site/dodo-webhook`).
    *   **Events**: Select `subscription.active`, `payment.succeeded`, `subscription.renewed`.
    *   Once saved, copy the **Webhook Signing Secret** (Starts with `whsec_`). This is your `DODO_PAYMENTS_WEBHOOK_SECRET`.

---

## 3. GitHub OAuth (Authentication)
Required for user login and repository scanning.

1.  Go to your **GitHub Settings** → **Developer Settings** → **OAuth Apps**.
2.  **New OAuth App**:
    *   **Homepage URL**: `https://your-vercel-domain.com`
    *   **Authorization callback URL**: `https://your-vercel-domain.com/api/auth/callback`
3.  **Vercel Variables**:
    *   `GITHUB_CLIENT_ID`: The ID from GitHub.
    *   `GITHUB_CLIENT_SECRET`: The generated Secret from GitHub.

---

## 🚀 Final Vercel Checklist
In your **Vercel Project Dashboard** → **Settings** → **Environment Variables**, ensure you have:

| Key | Example Value |
| :--- | :--- |
| `CONVEX_DEPLOYMENT` | `production:vibrant-ant-99` |
| `CONVEX_DEPLOY_KEY` | `prod:xxx...` (From Convex Settings) |
| `NEXT_PUBLIC_CONVEX_URL` | `https://vibrant-ant-99.convex.cloud` |
| `DODO_API_KEY` | `test_sk_...` |
| `DODO_PAYMENTS_WEBHOOK_SECRET` | `whsec_...` |
| `NEXT_PUBLIC_DODO_PUBLIC_KEY` | `test_pk_...` |
| `GITHUB_CLIENT_ID` | `Iv1.xxx...` |
| `GITHUB_CLIENT_SECRET` | `0b5xxx...` |
| `UPSTASH_REDIS_REST_URL` | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `Axxx...` |
| `MISTRAL_API_KEYS` | `sk-...,sk-...` (Rotational) |
| `OLLAMA_API_KEYS` | `ollama-...,ollama-...` (Rotational) |

**Note:** After adding these, you must trigger a **Redeploy** on Vercel for the changes to take effect.
