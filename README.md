<p align="center">
  <img src="public/logo.svg" alt="vulscany logo" width="96" />
</p>

<h1 align="center">vulscany</h1>

<p align="center">
  <strong>Local-first AI code security scanning for web applications.</strong><br>
  Pattern prefilter, AI investigation, adversarial revalidation, verified fixes, SARIF output.<br>
  Your source code never leaves your machine.
</p>

<p align="center">
  <a href="#what-it-does">What it does</a> •
  <a href="#quick-start">Quick start</a> •
  <a href="#cli-and-ci">CLI &amp; CI</a> •
  <a href="#how-it-works">How it works</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## What it does

vulscany scans a GitHub repository for application-security defects and produces review-ready findings and fixes.

| Capability | Details |
|---|---|
| **Static detection** | Dangerous HTML rendering (`dangerouslySetInnerHTML`, `v-html`, `[innerHTML]`, `{@html}`), code-execution sinks (`eval`, `new Function`, `child_process`), obfuscation, SSR injection, markdown XSS |
| **Secret detection** | AWS access keys, GitHub tokens (`ghp_`, `github_pat_`), OpenAI keys, Slack tokens, private-key blocks, generic `secret`/`token`/`password` assignments |
| **Supply-chain risk** | CVE matching and GitHub Advisory correlation per dependency, with an aggregated risk score |
| **Adversarial revalidation** | A second pass tries to falsify each finding. Rejected findings are dropped; undecided findings are downgraded to `low` |
| **Verified fixes** | Generated fixes must pass a validation ladder (code validation, TypeScript syntax diagnostics, rescan) before they are offered or turned into a PR |
| **SARIF / CI-native output** | SARIF 2.1.0, JUnit XML, Markdown, or raw JSON. Exits non-zero on high or critical findings |
| **Threat intelligence** | CVE feed and GitHub advisory correlation with in-memory caching and graceful degradation when offline |

## Quick start

Requirements: Node.js 18+ and a [GitHub OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

```bash
git clone https://github.com/instax-dutta/vulscany.git
cd vulscany
cp env.example .env.local   # fill in GitHub OAuth credentials
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with GitHub, and scan a repository.

**No database, no queue, no cloud services.** Scans and user state persist to a local JSON file at `.vulscany/data.json`; caches are in-process.

### Production build

```bash
npm run build
npm start
```

## CLI and CI

`vulscany scan` turns a scan result into a CI artifact and a pass/fail gate.

```bash
npm run scan:cli -- --in scan-result.json --out findings.sarif --format sarif
```

| Flag | Values | Purpose |
|---|---|---|
| `--in` | path to a `ScanResult` JSON file | Input scan result |
| `--out` | output path | Where the report is written |
| `--format` | `sarif` (default), `junit`, `markdown`, `json` | Report format |

Exit codes: `0` no high/critical findings, `1` high or critical findings present, `2` invalid usage.

Example CI step:

```yaml
- name: vulscany security gate
  run: npm run scan:cli -- --in scan-result.json --out findings.sarif --format sarif
```

Upload `findings.sarif` to GitHub code scanning to get findings rendered inline on pull requests.

## How it works

```text
repo ──▶ stack detection ──▶ pattern prefilter ──▶ secrets + Semgrep findings
                                          │
                                          ▼
                                 AI investigation
                                          │
                                          ▼
                              adversarial revalidation
                                          │
                                          ▼
                         fix generation ──▶ validation ladder ──▶ PR
                                          │
                                          ▼
                              SARIF / JUnit / Markdown / JSON
```

| Layer | Location | Responsibility |
|---|---|---|
| Scanner | `src/lib/scanner/` | Deterministic detectors, stack-aware rules, revalidation |
| Semgrep bridge | `src/lib/scanner/semgrep/` | Maps Semgrep JSON output into vulscany findings |
| Secrets | `src/lib/scanner/secrets/` | High-confidence secret prefilter |
| Revalidation | `src/lib/scanner/revalidate/` | Confirmed / rejected / undecided verdicts |
| AI | `src/lib/ai/` | Fix generation, validation ladder, provider rotation, response cache |
| Threat intel | `src/lib/threat-intel/` | CVE fetch, GitHub advisories, risk scoring |
| Reports | `src/lib/report/` | SARIF 2.1.0, JUnit, Markdown exporters |
| CLI | `src/cli/` | `scan` command with severity gate |

### Adversarial revalidation

Most scanners report whatever they matched. vulscany tries to disprove its own findings before reporting them:

- `confirmed` — kept at its original severity
- `rejected` — dropped from the report
- `undecided` — kept, but downgraded to `low` severity

Enable the pass with `VULSCANY_REVALIDATE=on`. A future release wires an LLM verifier into the same interface (`FindingVerifier`) so a model can attempt the falsification step.

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth app client secret |
| `SESSION_SECRET` | Yes | Session cookie encryption secret |
| `MISTRAL_API_KEY` | No | Enables AI fix generation. Without it, pattern-based fixes are used |
| `MISTRAL_API_KEYS` | No | Comma-separated key pool for rotation |
| `VULSCANY_REVALIDATE` | No | `on` enables the adversarial revalidation pass |

Scanning works without any AI provider. AI only affects fix generation quality and explanation detail.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI providers | Mistral AI, Ollama (local) |
| Storage | Local JSON file |
| Cache | In-process |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + Testing Library + MSW |
| Auth | GitHub OAuth |

## Development

```bash
npm run test:run       # vitest suite
npm run test:coverage  # coverage
npm run lint           # eslint
npm run build          # production build
```

Tests are colocated with the code they cover (`*.test.ts`, `*.test.tsx`). Fixtures for the detection benchmark live in `benchmarks/`, and its run writes `docs/benchmark-results.md`.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). The repository is organized as a DOX hierarchy: every subtree has an `AGENTS.md` describing its purpose, contracts, and verification commands. Read the chain for the files you are touching before you edit them.

The active modernization roadmap lives in the maintainers' workspace; branch and gate definitions are described in the project history.

## Security model

- Source code is read through the GitHub API and analyzed in-process. Nothing is uploaded to a third-party analysis service.
- AI calls, when enabled, send only the specific snippet being analyzed, not the whole repository.
- Findings are written to `.vulscany/data.json` on your machine and are never transmitted.

Report a vulnerability in the scanner itself via GitHub Security Advisories on the repository, not as a public issue.

## Brand

The mark is a scan frame (viewfinder brackets) around a verified shield: detection first, then proof.

| Asset | File | Use |
|---|---|---|
| Primary mark | `public/logo.svg` | Navbar, footer, sidebar, README, docs |
| App icon | `src/app/icon.svg` | Next.js app icon, favicon source |
| Favicon | `src/app/favicon.ico` | Browser tab, multi-size (16-64px) |
| Apple touch icon | `src/app/apple-icon.png` | iOS home screen, 180x180 |
| Social card | `src/app/opengraph-image.tsx` | Open Graph / Twitter card, generated at 1200x630 |

Palette: `#00D4FF` primary, `#00FFC8` secondary, `#04070C` mark knockout. Keep the mark on dark surfaces; it is transparent and needs no inversion filter.

Regenerate raster renditions after changing the SVG:

```bash
rsvg-convert -w 512 -h 512 -b none public/logo.svg -o public/logo.png
rsvg-convert -w 180 -h 180 src/app/icon.svg -o public/apple-touch-icon.png
magick -background none src/app/icon.svg -define icon:auto-resize=64,48,32,16 src/app/favicon.ico
```

## License

See [LICENSE](LICENSE).