# 🗺️ Aeglyn | Data Storage Architecture & Privacy Map

This document provides a comprehensive overview of how data flows through the Aeglyn (Vulscany) ecosystem, where it is stored, and the architectural reasoning behind each technology choice.

---

## 🏗️ Storage Strategy at a Glance

Aeglyn follows a **Hybrid Storage Architecture** designed to balance three competing requirements:
1. **Strict Privacy**: Zero retention of scanned source code (GDPR/Security).
2. **Real-time Performance**: Low-latency lookup for threat intelligence and rate limits.
3. **Transactional Integrity**: Precise tracking of user credits, billing, and scan history.

| Data Type | Location | Persistence | Purpose |
| :--- | :--- | :--- | :--- |
| **User Metadata & Billing** | Convex DB | Permanent | Accounts, Credits, Subscriptions |
| **Scan Results (Metadata)** | Convex DB | Permanent | History, Score Trends, Stats |
| **Transient Scan Data** | RAM (Vercel Edge) | Transient | Code scanning logic (In-memory DFS) |
| **Security Intel (CVEs)** | Upstash Redis | Cache (TTL) | High-speed vulnerability lookups |
| **Rate Limits** | Upstash Redis | Volatile | Abuse prevention |
| **Session Auth** | HTTP-Only Cookies | Sliding Window | Stateless Identity (GitHub OAuth) |

---

## 1. Convex DB: The Source of Truth
**Location:** Serverless Cloud (convex.dev)

### What is stored here?
*   **User Profiles (`users` table):** GitHub ID, Name, Email, Avatar, Subscription Tier.
*   **Balance & Usage (`creditUsage` table):** Credit balances, usage logs for every scan performed.
*   **Scan History (`scanHistory` table):** Repository names, vulnerability counts, risk scores, and scan durations.
*   **Payment Logs (`payments` table):** Transaction IDs from Dodo Payments.

### Why Convex DB?
*   **Reactive Integrity**: Convex automatically pushes updates to the frontend. When a user buys credits via Dodo, the balance updates instantly without a page refresh.
*   **Type Safety**: The entire schema is defined in TypeScript, preventing data corruption between the scanner and the billing engine.
*   **Built-in Auth Sync**: It handles complex relational queries (e.g., "Show me all high-risk scans for this user in January") more efficiently than simple KV stores like Redis.

---

## 2. Upstash Redis: The Speed Layer
**Location:** Global REST KV Store (upstash.io)

### What is stored here?
*   **Threat Intel Cache:** Public CVE data and security advisories fetched from NVD/GitHub.
*   **Rate Limit Counters:** Request counts per IP/User to prevent API abuse.

### Why Redis?
*   **Sub-millisecond Latency**: Security scanning requires checking thousands of dependency versions. Querying a traditional DB for every version would be too slow. Redis allows us to cache "Threat Intel" globally.
*   **Global Distribution**: Redis is edge-compatible, meaning it sits close to the user's Vercel deployment point.

---

## 3. Transient Memory: The Privacy Vault
**Location:** Vercel Edge Runtime / Worker RAM

### What is stored here?
*   **Raw Source Code**: The contents of the repository being scanned.

### Why Transient Memory?
*   **GDPR Compliance**: To ensure we **never store source code**, code is fetched from GitHub via API, analyzed in RAM during a single request cycle, and then immediately discarded. 
*   **Statelessness**: By never writing code to disk (SSD/DB), we minimize the attack surface. If Aeglyn's database were compromised, the attacker would find usage stats but **zero source code**.

---

## 4. GitHub OAuth & Cookies: The Session Layer
**Location:** User's Browser (Secure Cookies)

### What is stored here?
*   `github_token`: Encrypted access token for repository access.
*   `convex_user_id`: Cross-reference ID for billing.

### Why Cookies?
*   **Security**: By using `httpOnly` and `secure` tags, tokens are protected from XSS attacks. 
*   **Stateless Auth**: We don't store "sessions" in a database. The cookie itself proves the user's identity to GitHub, adhering to our core doctrine of minimal persistent state.

---

## 🧪 Summary of Choice: Why not SQL?
We avoided traditional SQL (PostgreSQL/MySQL) to eliminate the overhead of managing a database server and connections. **Convex** gives us relational power with a serverless DX, while **Redis** provides the raw speed needed for security intelligence operations.
