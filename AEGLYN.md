# 🛡️ Aeglyn: Technical Doctrine

> **Tagline**: Privacy-First React Security Sentinel
> **Vision**: To empower indie developers and solopreneurs with enterprise-grade security auditing without the baggage of heavy configurations or privacy compromises.

---

## 🆔 Identity & Vision
- **Name**: Aeglyn
- **Symbolism**: Derived from 'Aegis' (protection) and 'Lyn' (vision/insight). A sentinel that sees what others miss.
- **Branding**: Textless, initials-based, minimalist geometric design. Symbolizes clean structure and unbreakable boundaries.
- **Domain**: [aeglyn.site](https://aeglyn.site)

## 🎯 Market Positioning
Aeglyn addresses the high-velocity "Vibe Coding" market where speed often compromises security.

### Target Audience
- Indie Developers
- Solopreneurs
- Small Starter Agencies
- Full-stack Freelancers

### Competitive Edge
- **Vs Snyk**: Aeglyn is lightweight, zero-config, and specifically optimized for React/Next.js.
- **Vs CodeRabbit**: Aeglyn focuses on active security vulnerabilities and technical debt rather than general code review.

---

## 🛠️ Technical Doctrine

### Core Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4.0, Framer Motion
- **Backend**: Next.js Serverless Functions, Edge Runtime
- **AI Orchestration**: Dual-Stream Fallback (Local Ollama Mistral-7B | Cloud Mistral Large)
- **Persistence**: Upstash Redis (Global REST Layer) - **No permanent code storage.**

### Architecture Logic
1.  **GitHub Auth**: OAuth 2.0 -> HTTPOnly Cookies -> 2-hour sliding expiration.
2.  **Scanner Engine**: Recursive DFS (Depth=6). Regex pattern library for security hotspots.
3.  **Validation Engine**: Pre-commit blocking gate (HTTP 422). 9-point heuristic check (JSX nesting, Hook rules, security regressions).

### Security Hardening
- **Headers**: CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- **Build Safety**: Automated filters prevent code regression/injection during AI fix generation.

---

## 💰 Business & Monetization
**Model**: Credit-Based Freemium

### Pricing Tiers
- **Free Tier**: 10 monthly reset credits. Basic scan & AI explanations.
- **One-Time Packs**: Credits carry forward indefinitely.
- **Subscription**: Bulk discounts, priority processing, team features.

### Usage Costs
- **Repository Scan**: 1 Credit
- **AI Fix Generation**: 2 Credits
- **PR Automation**: 1 Credit

---

## ⚖️ Operational Doctrine
- **Founders**: Sai Dutta Abhishek Dash (Architect), Tejes Munde (Security Ops)
- **Payments**: Dodo Payments (Merchant of Record). Supports Local INR via UPI/Cards.
- **Privacy Pledge**: 
  1. No source code persistent storage.
  2. Minified code snippets used in AI prompts.
  3. 2-hour token lifespan to minimize hijacking risk.

---

## 🗺️ Roadmap
### Phase 1: Baseline (COMPLETED)
- [x] GitHub OAuth & Dashboard
- [x] Recursive Vulnerability Scanner
- [x] AI Explainability & Master Fix Prompts
- [x] Premium Threat Intel Bento UI
- [x] Build-Safety Validation Gate

### Phase 2: Launch (PENDING)
- [ ] Dodo Payments Integration
- [ ] Credit Wallet System
- [ ] Mass Repo Management
- [ ] AI-Generated README Security Seals

### Phase 3: Growth
- [ ] Multi-org GitHub support
- [ ] Slack/Discord Alerts
- [ ] API for CI/CD Pipelines
- [ ] Organization-wide Health Scoreboards
