# Convex Integration - Quick Start

This directory contains the Convex backend for Aeglyn's user data management.

## 📁 Structure

```
convex/
├── schema.ts          # Database schema (4 tables)
├── users.ts           # User management
├── scanHistory.ts     # Scan logging
├── subscriptions.ts   # Dodo subscription lifecycle
├── payments.ts        # Payment event logging
└── http.ts            # Dodo webhook endpoint
```

## 🗄️ Database Schema

### Tables

1. **users** - User accounts, token balances, subscriptions
2. **tokenUsage** - Token consumption logs (billing period tracking)
3. **scanHistory** - Scan metadata (NO source code - privacy-compliant)
4. **payments** - Dodo payment events

### Privacy Compliance

✅ **We store:**
- User identity (GitHub ID, email, name)
- Token balances and usage logs
- Scan metadata (repo name, vulnerability counts)

❌ **We NEVER store:**
- Source code
- File contents
- API keys or secrets

## 🚀 Development

### Initialize Convex
```bash
npx convex dev
```

### Deploy to Production
```bash
npx convex deploy
```

### View Data
https://dashboard.convex.dev

## 📡 Webhook Endpoint

Dodo Payments webhook: `https://your-deployment.convex.cloud/dodo-webhook`

**Events handled:**
- `subscription.active` → Allocate tokens
- `subscription.renewed` → Refresh tokens
- `subscription.on_hold` → Update status
- `payment.succeeded` → Log payment

## 🔧 Environment Variables

See `../env.example` for required env vars:
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `DODO_PAYMENTS_WEBHOOK_SECRET` (optional for webhook verification)

## 📝 Usage in Next.js

```typescript
import { convex, api } from '@/lib/convex/client';

// Query user
const user = await convex.query(api.users.getById, { userId });

// Deduct tokens
await convex.mutation(api.users.deductTokens, {
  userId,
  amount: 1,
  operation: 'scan',
});
```

## 🧪 Testing

Run Convex locally:
```bash
npx convex dev
```

Check the Console tab in Convex dashboard for logs.
