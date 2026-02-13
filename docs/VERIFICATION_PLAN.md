# 🛡️ Aeglyn | Final Verification & Security Plan

This document outlines the systematic verification process to ensure the integrity of the **Convex DB** and **Dodo Payments** integrations, security of the scanner engine, and overall system stability.

---

## 1. Security Verification (Security Auditor)

### 1.1 Webhook Integrity
- **Goal**: Prevent payment spoofing.
- **Task**: Audit `convex/http.ts` and verify that the `DODO_PAYMENTS_WEBHOOK_SECRET` is correctly used for signature validation.
- **Test Case**: Attempt to trigger a `subscription.active` mutation via manual POST request without a valid signature.

### 1.2 Data Privacy (Privacy Doctrine)
- **Goal**: Confirm zero-retention policy for source code.
- **Task**: Review `src/app/api/scan/route.ts` and `src/lib/scanner/index.ts`. Ensure file contents are never saved to Convex or Redis.
- **Verification**: Check Convex schema for any `code` or `snippet` fields.

### 1.3 GDPR Compliance
- **Goal**: Verify data portability.
- **Task**: Test `/api/user/export/route.ts`. 
- **Validation**: Ensure the export contains all transaction and metadata records but NO sensitive repo data.

---

## 2. API & Logic Verification (Backend Specialist)

### 2.1 Token Deduction Atomicity
- **Goal**: Prevent "double-spending" scans.
- **Task**: Audit `convex/users.ts` mutation `deductTokens`.
- **Logic Check**: Verify that token balance is checked and deducted *before* the expensive scan operation starts. Ensure the deduction is transactional.

### 2.2 Auth Synchronization
- **Goal**: Prevent orphaned users or session leaks.
- **Task**: Test `/api/auth/callback/route.ts`.
- **Validation**: Ensure GitHub users are correctly upserted into Convex and `convex_user_id` cookie is securely set.

### 2.3 Error Handling & Fallbacks
- **Goal**: Ensure the system doesn't "melt" under load or external failures.
- **Task**: Simulate Convex/Redis downtime and check if the scanner fails gracefully with clear error messages.

---

## 3. Stability & Performance (Performance Optimizer)

### 3.1 Rate Limiting
- **Goal**: Protect infra from abuse.
- **Task**: Verify Upstash Redis integration in `src/middleware.ts` or routes.
- **Stress Test**: Attempt 50 requests/min and confirm 429 status code.

### 3.2 Cold Start Optimization
- **Goal**: Ensure fast UI response.
- **Task**: Review dynamic imports in scanner and AI routes.

---

## 4. Verification Checklist

| Phase | Task | Agent | Status |
| :--- | :--- | :--- | :--- |
| **Foundation** | Webhook signature check | security-auditor | ⏳ |
| **Foundation** | Convex schema audit | database-architect | ⏳ |
| **Core** | Token deduction logic audit | backend-specialist | ⏳ |
| **Core** | Scanner privacy verification | security-auditor | ⏳ |
| **Polish** | Load test rate limits | test-engineer | ⏳ |
| **Polish** | Unit tests for mutations | test-engineer | ⏳ |

---

## 🚀 Execution Strategy

1. **Step 1**: Use `security-auditor` to verify webhook and privacy logic.
2. **Step 2**: Use `backend-specialist` to audit transactional logic and error handling.
3. **Step 3**: Use `test-engineer` to run Vitest suites for Convex mutations.

**Approval Required**: Please confirm this plan before final implementation begins.
