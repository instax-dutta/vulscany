import { SITE_CONFIG } from '@/config/site';

export const dynamic = 'force-static';

const CONTENT = `# vulscany

> ${SITE_CONFIG.branding.tagline}. vulscany scans GitHub repositories for application-security defects and produces review-ready findings and fixes. Source code is analyzed in-process and is never uploaded to a third-party analysis service.

Repository: ${SITE_CONFIG.urls.repo}
License: MIT
Runtime: Node.js 18+, Next.js 16, TypeScript

## What vulscany is

vulscany is a self-hosted code security scanner for web applications (React, Next.js, Vue, Angular, Svelte, Node, and generic JavaScript/TypeScript). It combines deterministic pattern detection with optional AI analysis, then tries to falsify its own findings before reporting them.

## Core capabilities

- Static detection: unsafe HTML rendering (dangerouslySetInnerHTML, v-html, [innerHTML], {@html}), code-execution sinks (eval, new Function, child_process), obfuscation, SSR injection, markdown XSS.
- Secret detection: AWS access keys, GitHub tokens (ghp_, github_pat_), OpenAI keys, Slack tokens, PEM private-key blocks, generic secret/token/password assignments.
- Supply-chain risk: CVE matching and GitHub Advisory correlation per dependency with an aggregated risk score.
- Adversarial revalidation: each finding receives a confirmed / rejected / undecided verdict. Rejected findings are dropped; undecided findings are downgraded to low severity.
- Validated fixes: generated fixes pass a validation ladder (code validation, TypeScript syntax diagnostics, rescan) before being offered or turned into a pull request.
- SARIF 2.1.0, JUnit XML, Markdown, and JSON output for CI and code-scanning ingestion.
- Threat intelligence with in-memory caching and graceful degradation when offline.

## Getting started

\`\`\`bash
git clone ${SITE_CONFIG.urls.repo}
cd vulscany
cp env.example .env.local
npm install
npm run dev
\`\`\`

Required environment variables: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SESSION_SECRET.
Optional: MISTRAL_API_KEY (AI fix generation), VULSCANY_REVALIDATE=on (adversarial revalidation pass).

Storage is a local JSON file at .vulscany/data.json. No database, queue, or cloud service is required.

## CLI

\`\`\`bash
npm run scan:cli -- --in scan-result.json --out findings.sarif --format sarif
\`\`\`

Exit codes: 0 (no high or critical findings), 1 (high or critical findings present), 2 (invalid usage).

## Commands

- \`npm run dev\` - development server
- \`npm run build\` / \`npm start\` - production build and server
- \`npm run test:run\` - vitest suite
- \`npm run lint\` - eslint
- \`npm run scan:cli\` - scan report CLI

## When to use vulscany

Use it when code must stay on your own machine, when you want a self-hosted alternative to SaaS code-security platforms, or when you want SARIF findings in pull-request review without per-seat pricing.

## When not to use vulscany

It is not a full SAST engine with inter-procedural dataflow, not a container or IaC scanner, and not a fuzzing or runtime-exploitability tool.

## Project structure

- src/lib/scanner - detectors, Semgrep bridge, secrets prefilter, revalidation
- src/lib/ai - fix generation, validation ladder, provider rotation, response cache
- src/lib/threat-intel - CVE fetch, GitHub advisories, risk scoring
- src/lib/report - SARIF, JUnit, Markdown exporters
- src/cli - scan CLI with severity gate
- src/app - Next.js App Router pages and API routes
- benchmarks - detection fixture harness
`;
export async function GET() {
    return new Response(CONTENT, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}