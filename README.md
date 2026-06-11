# vulscany

Privacy-first React security scanner with AI-powered threat intelligence.

## Features

- Scan codebases for vulnerabilities and security issues
- AI-powered fix generation and remediation suggestions
- GitHub integration for PR-based scanning
- Dashboard with real-time scan results and analytics
- Threat intelligence feeds (CVE, GitHub Advisories)
- Batch scanning for large codebases
- Rate limiting and caching for API efficiency

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Storage:** Local JSON file (`.vulscany/data.json`) — zero external services
- **AI:** Ollama / Mistral AI for fix generation and analysis
- **Styling:** Custom CSS with design tokens
- **Testing:** Vitest
- **Auth:** GitHub OAuth

## Prerequisites

- Node.js 18+
- npm
- GitHub OAuth app (for authentication)
- Ollama or Mistral API key (optional, for AI features)

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/instax-dutta/vulscany.git
   cd vulscany
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env.local
   ```
   Fill in the required environment variables:
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — from GitHub OAuth app
   - `SESSION_SECRET` — a random string for session encryption
   - `MISTRAL_API_KEY` — optional, for AI-generated fix suggestions

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

> All data (users, scan history) is stored locally in `.vulscany/data.json`. No database, no external services required. Your data never leaves your machine.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint codebase |
| `npm run typecheck` | TypeScript type checking |

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (auth, scan, batch-scan, AI, threat-intel)
│   ├── dashboard/    # Dashboard page
│   ├── features/     # Features page
│   ├── pricing/      # Pricing page
│   ├── privacy/      # Privacy policy
│   ├── terms/        # Terms of service
│   ├── why/          # Why page
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Landing page
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── landing/      # Landing page components
│   ├── ui/           # Base UI components
│   └── ...           # Feature components
├── lib/
│   ├── ai/           # AI integration (Mistral, Ollama, prompts)
│   ├── cache/        # In-memory caching layer
│   ├── github/       # GitHub API client
│   ├── local-store.ts # Local JSON file storage
│   ├── scanner/      # Code scanner engine
│   ├── threat-intel/ # Threat intelligence (CVE, advisories)
│   └── validators/   # Code validators
├── config/           # Site configuration
├── constants/        # Constants
└── middleware.ts     # Auth middleware
```

## Self-Hosting

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

Deploy with the Vercel CLI or connect your GitHub repo to Vercel. Set all environment variables from `.env.example` in your Vercel project dashboard.

## Privacy

This application is designed for complete privacy when self-hosted:

- **No external database** — all data stored in a local JSON file
- **No telemetry** — zero data sent to external services
- **No credit system** — unlimited scanning
- **No payments** — no payment infrastructure
- **Scan metadata only** — source code is never stored, only vulnerability metadata

## License

MIT
