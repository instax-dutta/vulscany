<p align="center">
  <img src="src/app/icon.svg" alt="vulscany" width="80" />
</p>

<h1 align="center">vulscany</h1>

<p align="center">
  <strong>Your private, self-hostable AI-powered code security agent.</strong>
  <br>
  Ship with confidence. Scan like a team of security engineers — without sending your code anywhere.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#why-vulscany">Why vulscany</a> •
  <a href="#self-hosting">Self-Hosting</a> •
  <a href="#the-backstory">The Backstory</a>
</p>

---

vulscany is the production-grade code security scanner that was once built by a venture-backed security startup — before market timing forced an early curtain call. The code is battle-tested, the architecture is sound, and the core mission lives on: **give every developer god-tier security scanning, without the SaaS markup or the data leaving your machine.**

## Features

- **AI-Powered Fix Generation** — Not just vulnerability detection. vulscany explains the issue, suggests a fix, and can generate a PR.
- **Multi-Language Scanning** — React, Next.js, TypeScript, JavaScript, Python, and more. Stack-aware detection that understands your framework.
- **Threat Intelligence** — Real-time CVE matching and GitHub Advisory correlation. Know if a dependency is compromised before the news breaks.
- **Batch Scanning** — Scan your entire org in one shot. Parallel execution, aggregated summaries, sorted by severity.
- **Privacy by Architecture** — Your source code never leaves your machine. Every scan runs locally. No telemetry. No data leaks.
- **GitHub Native** — OAuth login, repo-level scanning, automated PR creation. Feels like a first-party GitHub feature.
- **Self-Contained** — Zero external services. No database to provision. No Redis, no Convex, no cloud dependencies. Just `npm run dev`.

## Quick Start

```bash
git clone https://github.com/instax-dutta/vulscany.git
cd vulscany
cp env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), authenticate with GitHub, and scan your first repo.

> **Zero infrastructure required.** All data is stored in a local JSON file (`.vulscany/data.json`). There's nothing to configure, nothing to deploy, nothing to pay for.

## Why vulscany

Most code security tools fall into one of two camps:

1. **SaaS platforms** that require you to upload your code to someone else's servers, trust their data handling, and pay per seat.
2. **Open-source CLI tools** that are powerful but feel like they were designed in 2008 — no dashboard, no AI, no GitHub integration.

vulscany bridges the gap. You get the polish of a production SaaS product with the privacy and autonomy of local-first software. It's the security scanner that a startup raised millions to build — now yours for a `git clone`.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI | Mistral AI / Ollama |
| Storage | Local JSON file |
| Cache | In-memory |
| Styling | Tailwind CSS |
| Testing | Vitest |
| Auth | GitHub OAuth |

## Documentation

- **Setup guide** — see [Quick Start](#quick-start)
- **Environment config** — copy `env.example` to `.env.local` and fill in your GitHub OAuth credentials
- **AI features** — optional. Set `MISTRAL_API_KEY` for fix generation, or use Ollama locally

### Prerequisites

- Node.js 18+
- A [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) (for authentication)
- A Mistral API key or local Ollama instance (optional, for AI features)

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

Connect your fork to Vercel, set the environment variables from `.env.example`, and deploy. No database, no queue, no infrastructure — it just works.

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (auth, scan, batch-scan, AI, threat-intel)
│   ├── dashboard/    # Dashboard page
│   └── ...           # Landing, features, pricing, legal pages
├── components/       # React components
├── lib/
│   ├── ai/           # Mistral + Ollama integration
│   ├── cache/        # In-memory caching
│   ├── github/       # GitHub API client
│   ├── local-store.ts # Local JSON file storage
│   ├── scanner/      # Code scanner engine
│   ├── threat-intel/ # CVE and advisory matching
│   └── validators/   # Code validators
├── config/
├── constants/
└── middleware.ts
```

## The Backstory

vulscany was originally the core product of a venture-backed security startup. We raised money, built a team, and spent months engineering a production-grade code security platform — AI-powered scanning, threat intelligence, automated remediation, the works.

Then the market shifted. The timing wasn't right, the round didn't close, and the company wound down.

But the code was too good to sit in a private repo.

So we cleaned it up, stripped the SaaS infrastructure, swapped the cloud dependencies for local storage, and opened it up. vulscany is what you get when a funded startup's engineering effort meets open-source pragmatism.

It's the product we wish someone had built for us. Now it's yours.

---

<p align="center">
  <strong>vulscany</strong> — private, self-hosted, AI-powered code security.<br>
  No data leaves your machine. No SaaS tax. No compromises.
</p>

<p align="center">
  <a href="https://github.com/instax-dutta/vulscany">GitHub</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a>
</p>
