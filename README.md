# Aeglyn - Privacy-First AI Code Security Scanner

**Privacy-First React Security Scanner with AI-Powered Threat Intelligence**

> **Development Note**: Aeglyn is now a single-deployment unified platform. Development is consolidated in this repository.

Domain: [aeglyn.site](https://aeglyn.site)

---

## 🌟 Overview

Aeglyn is a proprietary SaaS platform that scans React applications for security vulnerabilities. It combines static analysis, AI-powered explanations, and real-time threat intelligence to help developers ship secure code fast.

As of Jan 2026, Aeglyn has moved to a **Single Deployment Architecture**, merging the marketing landing page and the functional application into a single Next.js project for smoother development and easier maintenance.

### ✨ Key Features

- 🔍 **Deep Security Scanning** - XSS, injection, and React-specific vulnerabilities
- 🤖 **AI-Powered Analysis** - Instant explanations with Redis caching (70-80% API cost reduction)
- 🚀 **One-Click Auto-Fix** - Generate pull requests with security fixes automatically
- 📋 **Copy-Paste Fixes** - One-click copy of ready-to-use code snippets
- 🎓 **Beginner-Friendly** - Interactive onboarding and guided tutorials
- 📱 **Mobile-Responsive** - Beautiful UI across all devices
- 🛡️ **Threat Intelligence** - Real-time CVE data from NVD and GitHub
- 📊 **Risk Assessment** - CVSS-based scoring with multi-factor analysis
- 🔒 **Privacy-First** - Zero code storage, memory-only scanning
- ⚡ **Batch Scanning** - Multi-repository parallel processing

---

## 📢 Latest Updates

### v3.0.0 - Unified Single Deployment (Jan 2026)

✅ **Single Domain Consolidation**
- Merged `aeglyn-landing` into the main application.
- Unified deployment at `aeglyn.site` (removed `app.aeglyn.site` subdomain requirement).
- Shared design system between landing and app components.
- Significantly reduced deployment overhead and simplified environment management.

### v2.1.0 - Vibe Coding Community Features (Dec 2025)

✅ **One-Click Fix Generation**
- Auto-generates PRs with security fixes.
- Preview mode to review diffs before committing.

✅ **Copy-Paste Fix Snippets**
- Beautiful one-click copy button for fix suggestions.

✅ **Beginner-Friendly Onboarding**
- Interactive 7-step guided tour.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- GitHub OAuth App (see setup below)
- Ollama Cloud API keys
- Mistral AI API keys (optional fallback)
- Upstash Redis (highly recommended)

### GitHub OAuth Setup

1. **Create OAuth App**: https://github.com/settings/developers
   - Name: `Aeglyn`
   - Homepage: `https://aeglyn.site`
   - Callback: `https://aeglyn.site/api/auth/callback`

2. **Get Credentials**:
   - Copy Client ID
   - Generate Client Secret

3. **Update Environment Variables**

### Local Installation

```bash
git clone <repository-url>
cd vulscany
npm install
cp env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### Environment Variables

**Local Development** (`.env.local`):

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# AI Services (comma-separated for rotation)
OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=key1,key2

# Redis Cache (Highly Recommended)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

NODE_ENV=development
```

**Production** (Vercel Environment Variables):

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_secret
OLLAMA_API_KEYS=your_keys
MISTRAL_API_KEYS=your_keys
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
NODE_ENV=production
```

---

## 🏗️ Architecture

### System Flow

```
User visits aeglyn.site
    ↓
Landing Page (Marketing + CTA)
    ↓
Authentication (GitHub OAuth)
    ↓
Dashboard (Vulnerability Scanning)
    ├─→ Check AI Cache (Redis)
    ├─→ AI Analysis (Ollama/Mistral)
    └─→ Threat Intelligence (NVD + GitHub)
    ↓
Results + PR Fix Operations
```

### Technology Stack

**Unified Frontend & Backend:**

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4 (Styling)
- Framer Motion (Animations)
- AI SDK (Mistral + Ollama)
- Upstash Redis (Caching)
- GitHub Octokit (Integration)

---

## 🔒 Security & Privacy

### Privacy-First Architecture

- **Code Handling**: Scanned in memory only, never stored, discarded immediately after scan.
- **GitHub Access**: OAuth with short-lived tokens, stored in secure httpOnly cookies.
- **Data Storage**: Only caches public CVE data and anonymized AI patterns. No user code in Redis.

---

## 📄 License

Proprietary - All rights reserved.

**Maintained by**: Sai Dutta Abhishek Dash & Tejes Munde
