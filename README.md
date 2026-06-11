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
- **Database:** Convex (schema, users, subscriptions, scan history)
- **AI:** Ollama / Mistral AI for fix generation and analysis
- **Styling:** Custom CSS with design tokens
- **Testing:** Vitest
- **Auth:** GitHub OAuth

## Prerequisites

- Node.js 18+
- npm
- A Convex account (for database)
- GitHub OAuth app (for authentication)
- Ollama or Mistral API key (for AI features)

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
   - `CONVEX_DEPLOY_KEY` — from your Convex dashboard
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — from GitHub OAuth app
   - `MISTRAL_API_KEY` or Ollama endpoint — for AI features
   - `SESSION_SECRET` — a random string for session encryption

4. **Run Convex dev server**
   ```bash
   npx convex dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

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
│   ├── cache/        # Caching layer
│   ├── convex/       # Convex client
│   ├── github/       # GitHub API client
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

### Convex

This project uses Convex as its database. Deploy your Convex backend:

```bash
npx convex deploy
```

## License

MIT
