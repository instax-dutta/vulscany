# 🛡️ Aeglyn | Proprietary Security Engine

**Internal Engineering Documentation**  
*Confidential - For Internal Use Only*

---

## 🏗️ Core Doctrine
Aeglyn is a privacy-first, enterprise-grade React security sentinel designed for high-velocity "Vibe Coding" environments. It operates on a **Single Deployment Architecture**, unifying the marketing surface and the functional scanning engine into a single Next.js 15+ primitive.

### 🔑 Security & Privacy Compliance
1. **Zero-Retention Scanning**: Source code is processed in transient memory and never persists in any database.
2. **Stateless Auth**: GitHub OAuth tokens mapped to `httpOnly` secure cookies with 2-hour sliding expirations.
3. **Deterministic Persistence**: Redis is used strictly for User Stats, Achievements, and AI Pattern caching (70-80% cost reduction).

---

## ⚡ Technical Specification

### Tech Stack
- **Framework**: Next.js 15 (App Router), React 19
- **Style**: Tailwind CSS v4.0 (CSS-first configuration)
- **State/Caching**: Upstash Redis (Global REST Layer)
- **AI Engine**: Dual-Stream (Local Ollama Mistral-7B / Cloud Mistral Large)
- **Infrastructure**: Vercel Edge Runtime (API/Middleware)

### System Components
- **Scanner Engine**: Recursive DFS depth-limited crawling (Depth=6).
- **Validation Engine**: Pre-commit blocking gate (HTTP 422) for AI-generated code.
- **Threat Intel**: Real-time CVE ingestion via NVD & GitHub Security Advisories.

---

## 🚀 Internal Setup

### Prerequisites
- Node.js 20+
- GitHub OAuth Internal App Credentials
- Upstash Redis Instance (Global)
- AI Provider Keys (Mistral / Ollama)

### Local Launch
```bash
git clone [internal-repo-url]
npm install
cp .env.example .env.local
# Configure internal keys
npm run dev
```

### Environment Variables (Internal Schema)
```env
# AUTH (Internal Security)
GITHUB_CLIENT_ID=prod_int_...
GITHUB_CLIENT_SECRET=prod_sec_...
SESSION_SECRET=...

# AI INFRA
MISTRAL_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🛠️ Operations & DevOps
- **Merchant of Record**: Dodo Payments (Local INR/UPI & Global Stripe)
- **Telemetry**: Sentry (Error Tracking) & PostHog (Product Analytics)
- **Deployment**: Consolidated `aeglyn.site` (Production)

---

## ⚖️ Ownership
**Founders**: Sai Dutta Abhishek Dash (Architecture) & Tejes Munde (Security Ops)  
**License**: Proprietary - Private Repository. Unauthorized reproduction is strictly prohibited.
