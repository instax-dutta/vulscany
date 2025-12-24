# VullScanny - Complete Technical Documentation

> **Privacy-First React Security Scanner with AI-Powered Auto-Fix**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Core Components](#core-components)
5. [AI Integration](#ai-integration)
6. [Security Scanner](#security-scanner)
7. [Auto-Fix PR System](#auto-fix-pr-system)
8. [Onboarding System](#onboarding-system)
9. [API Reference](#api-reference)
10. [Deployment](#deployment)
11. [Environment Variables](#environment-variables)

---

## 🎯 Overview

VullScanny is a **privacy-first** security scanner designed specifically for React and Next.js applications. It scans GitHub repositories for common security vulnerabilities and can automatically generate Pull Requests with fixes.

### Key Principles

- **Privacy First**: Your code is NEVER stored on our servers
- **AI-Powered**: Uses Mistral AI for intelligent vulnerability analysis and fix generation
- **One-Click Fixes**: Generate complete PR with security fixes in seconds
- **No Lock-in**: All scans happen in real-time using your GitHub token

### Target Audience

- React/Next.js developers
- Security-conscious teams
- Beginner "vibe coders" learning security best practices

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | CSS Modules, Framer Motion |
| AI | Mistral AI (Cloud API) |
| Caching | Upstash Redis |
| Auth | GitHub OAuth |
| Deployment | Vercel / Docker |

### Directory Structure

```
vulscany/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── ai/            # AI endpoints
│   │   │   ├── auth/          # GitHub OAuth
│   │   │   ├── scan/          # Scanning endpoints
│   │   │   └── repos/         # Repository fetching
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── privacy/           # Privacy policy
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   └── Onboarding.tsx     # Interactive onboarding
│   └── lib/                   # Core libraries
│       ├── ai/                # AI integration
│       │   ├── fix-generator.ts
│       │   ├── mistral.ts
│       │   ├── pr-context.ts
│       │   └── response-cache.ts
│       ├── github/            # GitHub integration
│       │   ├── client.ts
│       │   └── pr-creator.ts
│       ├── scanner/           # Vulnerability scanner
│       │   └── index.ts
│       └── validators/        # Code validation
│           └── code-validator.ts
└── public/                    # Static assets
```

### Data Flow

```
User clicks "Scan Repository"
         ↓
GitHub API → Fetch repo files
         ↓
Scanner → Analyze for vulnerabilities
         ↓
Mistral AI → Explain vulnerabilities
         ↓
Dashboard → Display results
         ↓
User clicks "Auto-Fix"
         ↓
AI → Generate complete fixes
         ↓
Validator → Check code validity
         ↓
GitHub API → Create PR
```

---

## ✨ Features

### 1. GitHub OAuth Authentication

**Implementation**: `/src/app/api/auth/`

```typescript
// Callback handler stores token in HTTP-only cookie
const response = NextResponse.redirect(dashboardUrl);
response.cookies.set('github_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
});
```

**Features**:

- Secure token storage in HTTP-only cookies
- Automatic redirect after auth
- Token refresh handling
- Logout endpoint

### 2. Repository Scanning

**Implementation**: `/src/lib/scanner/index.ts`

**Vulnerability Types Detected**:

| Type | Severity | Description |
|------|----------|-------------|
| `dangerous-api` | High | `dangerouslySetInnerHTML` without sanitization |
| `xss-vulnerable-attribute` | High | Unsafe href/src attributes |
| `ssr-injection` | Critical | Server-side code injection |
| `markdown-xss` | Medium | XSS via Markdown rendering |
| `code-execution-pattern` | Critical | `eval()`, `Function()` usage |
| `version` | Varies | Outdated dependencies with CVEs |
| `dependency` | Varies | Vulnerable npm packages |

**Scanning Process**:

1. Fetch repository file tree
2. Filter for JS/TS/JSX/TSX files
3. Fetch file contents
4. Run pattern matching for each vulnerability type
5. Generate recommendations

### 3. AI-Powered Analysis

**Implementation**: `/src/lib/ai/mistral.ts`

**Features**:

- Vulnerability explanation generation
- Fix suggestion generation
- Response caching with Redis
- API key rotation for reliability

**API Integration**:

```typescript
const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model: 'mistral-medium-latest',
        messages: [...],
        temperature: 0.2,
        max_tokens: 8000
    })
});
```

### 4. One-Click Auto-Fix PR

**Implementation**: `/src/lib/ai/fix-generator.ts`, `/src/lib/github/pr-creator.ts`

**Complete Flow**:

```
1. CONTEXT GATHERING
   └─→ Fetch package.json (dependencies)
   └─→ Fetch tsconfig.json (TypeScript config)
   └─→ Extract existing imports from files
   └─→ Detect framework (Next.js version, App Router)

2. FIX GENERATION
   └─→ Build comprehensive prompt with all context
   └─→ Call Mistral AI for complete fixed file
   └─→ Validate AI response (looks like code)
   └─→ Fallback to pattern-based fix if needed

3. CODE VALIDATION
   └─→ Check balanced delimiters
   └─→ Verify imports exist in dependencies
   └─→ Detect common issues (console.log, eval)
   └─→ TypeScript compliance check

4. PR CREATION
   └─→ Check for existing VullScanny PRs (prevent duplicates)
   └─→ Create new branch
   └─→ Commit fixed files
   └─→ Create PR with validation report
   └─→ Add tracking labels
```

**Duplicate Prevention**:

```typescript
async function hasExistingSecurityPR(octokit, owner, repo) {
    const { data: prs } = await octokit.pulls.list({
        owner, repo, state: 'open'
    });
    
    return prs.find(pr => 
        pr.head.ref.startsWith('vullscanny/security-fixes-') ||
        pr.title.includes('🔒 Security Fixes')
    );
}
```

### 5. Interactive Onboarding

**Implementation**: `/src/components/Onboarding.tsx`

**Two Modes**:

1. **Modal Mode (Steps 0-2)**:
   - Welcome screen with personalization
   - Name collection
   - Goal selection (scan/learn/fix/explore)

2. **Interactive Tour Mode (Steps 3-6)**:
   - Dashboard visible in background
   - Spotlight highlighting specific elements
   - Demo data injection
   - Corner tooltip guidance

**Spotlight Mechanism**:

```typescript
const spotlightTargets: Record<number, string> = {
    3: 'repo-section',      // Repository sidebar
    4: 'scan-results',      // Scan results panel
    5: 'auto-fix',          // Auto-fix button
};

// CSS box-shadow creates spotlight effect
boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`
```

**Demo Data**:

```typescript
const createDemoData = () => ({
    'demo/my-awesome-app': {
        repoName: 'my-awesome-app',
        status: 'issues',
        vulnerabilities: [
            { type: 'dangerous-api', severity: 'high', ... },
            { type: 'ssr-injection', severity: 'medium', ... }
        ]
    }
});
```

### 6. Responsive Design

**Implementation**: `/src/app/dashboard/mobile-responsive.css`

**Breakpoints**:

- Desktop: > 768px
- Tablet: ≤ 768px
- Mobile: ≤ 480px

**Features**:

- Collapsible sidebar on mobile
- Touch-friendly interactions
- Safe area handling for notched devices
- iOS zoom prevention

---

## 🤖 AI Integration

### Mistral AI Configuration

**Models Used**:

- `mistral-medium-latest` - For code generation (fix generation)
- `mistral-small-latest` - For explanations (faster, cheaper)

**API Key Rotation**:

```typescript
// Supports multiple API keys for reliability
const keys = process.env.MISTRAL_API_KEYS; // "key1,key2,key3"
const keyList = keys.split(',');

// Rotate on failure
function getNextKey() {
    return keyList[currentIndex++ % keyList.length];
}
```

### Response Caching

**Implementation**: `/src/lib/ai/response-cache.ts`

Uses Upstash Redis to cache:

- Vulnerability explanations
- Common vulnerability patterns
- Frequently requested fixes

**TTL**: 24 hours for explanations, 1 hour for scans

### Fix Generation Prompt

```typescript
const systemPrompt = `You are an expert security engineer...

CRITICAL RULES:
1. Return ONLY the complete fixed file code
2. NO markdown code blocks
3. PRESERVE all existing imports
4. Use DOMPurify.sanitize() for dangerouslySetInnerHTML
5. Validate URLs before using in href
...`;
```

---

## 🔍 Security Scanner

### Pattern Matching

**Example: Detecting dangerouslySetInnerHTML**

```typescript
// Pattern for unsanitized dangerouslySetInnerHTML
const pattern = /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*([^}]+)\s*\}\s*\}/g;

// Check if already sanitized
if (!match.includes('DOMPurify') && !match.includes('sanitize')) {
    vulnerabilities.push({
        type: 'dangerous-api',
        severity: 'high',
        title: 'Unsanitized HTML Rendering',
        recommendation: 'Use DOMPurify.sanitize()'
    });
}
```

### Severity Classification

| Severity | Examples |
|----------|----------|
| Critical | `eval()`, SSR injection, RCE |
| High | XSS, dangerouslySetInnerHTML |
| Medium | Outdated deps, markdown XSS |
| Low | Minor config issues |

---

## 🔧 Auto-Fix PR System

### Context Gathering

**File**: `/src/lib/ai/pr-context.ts`

```typescript
export async function getProjectContext(accessToken, owner, repo, fileContent) {
    // 1. Fetch package.json
    const packageJson = await fetchFile('package.json');
    
    // 2. Fetch tsconfig.json
    const tsConfig = await fetchFile('tsconfig.json');
    
    // 3. Check for app directory (App Router)
    const hasAppRouter = await checkDirectory('app');
    
    // 4. Extract imports from target file
    const imports = extractFileImports(fileContent);
    
    return {
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies,
        typescript: { strict: tsConfig.compilerOptions?.strict },
        framework: { name: 'Next.js', isAppRouter: hasAppRouter },
        fileImports: imports
    };
}
```

### Code Validation

**File**: `/src/lib/validators/code-validator.ts`

**Checks Performed**:

1. Balanced delimiters (brackets, braces, parentheses)
2. Import validation (packages exist in dependencies)
3. Common issues (console.log, debugger, eval)
4. TypeScript patterns (excessive `any` types)
5. Security patterns (dangerouslySetInnerHTML without sanitization)

```typescript
export function validateGeneratedCode(code, availablePackages) {
    const errors = [];
    const warnings = [];
    
    errors.push(...checkBalancedDelimiters(code));
    errors.push(...validateSyntax(code));
    warnings.push(...validateImports(code, availablePackages));
    
    const issues = checkCommonIssues(code);
    errors.push(...issues.errors);
    warnings.push(...issues.warnings);
    
    return { valid: errors.length === 0, errors, warnings };
}
```

### PR Description Format

```markdown
## 🛡️ Security Fixes by VullScanny

### Files Changed
- `src/components/UserProfile.tsx` (1 issue)

### 🔍 Validation Results
✅ **All checks passed!** No errors or warnings detected.

### Details
#### src/components/UserProfile.tsx

**Commit Message:**
fix(security): Unsanitized HTML Rendering

**Changes:**
```diff
+ import DOMPurify from 'dompurify';
- <div dangerouslySetInnerHTML={{ __html: userBio }} />
+ <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />
```

### ✅ What to do next

1. Review the changes
2. Run `npm install` if new dependencies were added
3. Run `npm run build` to verify
4. Merge when ready

```

---

## 📡 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/callback` | GET | GitHub OAuth callback |
| `/api/auth/logout` | GET | Clear session |

### Scanning

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/repos/react` | GET | List user's repositories |
| `/api/scan` | POST | Scan a repository |
| `/api/batch-scan` | POST | Scan multiple repos |

### AI

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/explain` | POST | Explain vulnerability |
| `/api/ai/generate-pr` | POST | Generate fix PR |
| `/api/ai/generate-prompt` | POST | Generate master fix prompt |
| `/api/ai/batch-fix` | POST | Generate fixes for all vulns |

### Example: Generate PR

```typescript
// POST /api/ai/generate-pr
{
    "owner": "username",
    "repo": "my-app",
    "vulnerabilities": [
        {
            "id": "vuln-1",
            "type": "dangerous-api",
            "severity": "high",
            "file": "src/components/User.tsx",
            "line": 42,
            "snippet": "<div dangerouslySetInnerHTML={{...}} />"
        }
    ],
    "baseBranch": "main",
    "mode": "create" // or "preview"
}

// Response
{
    "success": true,
    "prUrl": "https://github.com/user/repo/pull/123",
    "prNumber": 123,
    "branch": "vullscanny/security-fixes-1703500000000",
    "filesChanged": 1
}
```

---

## 🚀 Deployment

### Environment Variables

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key

# Mistral AI
MISTRAL_API_KEYS=key1,key2,key3

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Optional
NODE_ENV=production
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel

```bash
# Deploy to Vercel
vercel --prod

# Or link and deploy
vercel link
vercel deploy --prod
```

---

## 📊 Performance Optimizations

### Caching Strategy

| Data | Cache Location | TTL |
|------|----------------|-----|
| AI Explanations | Redis | 24 hours |
| Scan Results | Redis | 1 hour |
| GitHub Tokens | HTTP Cookie | 7 days |
| Static Assets | CDN | 1 year |

### API Key Rotation

Multiple API keys prevent rate limiting:

```javascript
MISTRAL_API_KEYS=key1,key2,key3
```

Keys are rotated automatically on failure.

---

## 🔐 Security Considerations

### Data Privacy

- **No code storage**: Files are processed in memory only
- **Token security**: HTTP-only cookies
- **Encrypted transit**: HTTPS only in production

### GitHub Token Scope

Required scopes:

- `repo` - Access repositories
- `read:user` - Read user profile

### Rate Limiting

- GitHub API: 5000 requests/hour (authenticated)
- Mistral API: Based on plan
- Redis: Unlimited (Upstash serverless)

---

## 🎯 Product Vision & Roadmap

### Mission

Transform VullScanny into the ultimate security scanning tool for the **vibe coding community** - developers who want to ship fast, code clean, and stay secure without getting bogged down in complexity.

### Core Philosophy

For Vibe Coders:

1. **Fast** - Results in seconds, not minutes
2. **Clear** - No jargon, plain English
3. **Actionable** - Show me the fix, not a thesis
4. **Fun** - Gamification, achievements, vibes ✨
5. **Accessible** - Beginner to expert, all welcome

---

## ✅ Implemented Features

### Phase 1: Quick Wins (COMPLETED)

| Feature | Status | Description |
|---------|--------|-------------|
| One-Click Fix Generation | ✅ Done | Auto-generate PR with security fixes |
| Copy-Paste Fix Snippets | ✅ Done | One-click copy of ready-to-use code |
| Beginner-Friendly Onboarding | ✅ Done | Interactive tour with demo data |
| Mobile-Responsive Dashboard | ✅ Done | Beautiful responsive design for all devices |

### One-Click Fix Generation ⚡

**Why Vibe Coders Love It:**

- "FIX ALL" button = instant dopamine
- No context switching to implement
- Learn by seeing actual code changes
- Ship secure code in minutes, not hours

### Copy-Paste Fix Snippets 📋

**Features:**

- Syntax-highlighted fix snippets
- One-click copy with success toast
- "Before & After" side-by-side view
- Include import statements automatically

### Interactive Onboarding 🎓

**First-Time Flow:**

```
1. Welcome! Let's scan your first repo →
2. Here's what we found (with emojis!) →
3. Let's fix the first issue together →
4. 🎊 You did it! Here's what you learned →
5. Ready to scan more repos?
```

---

## 🚀 Future Roadmap

### Phase 2: Core Features (Planned)

| Feature | Priority | Description |
|---------|----------|-------------|
| CLI Tool | High | `npx vullscanny scan ./src` |
| GitHub Action | High | Auto-scan on every PR |
| Security Score Dashboard | Medium | Gamified security tracking |

#### CLI Tool 💻

```bash
# Quick scan
npx vullscanny scan ./src

# CI mode
npx vullscanny scan --fail-on=high --format=json

# Watch mode (dev)
npx vullscanny watch ./src --fix-on-save
```

#### GitHub Action 🎬

```yaml
name: Security Scan
on: [pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: vullscanny/scan-action@v1
        with:
          fail-on: critical
          comment-pr: true
```

#### Security Score Dashboard 📊

- Overall security score (0-100)
- Score history chart
- "Days since last vulnerability" counter
- Achievement badges (🏆 "7 days secure", "100 scans")

---

### Phase 3: Advanced Features (Future)

| Feature | Description |
|---------|-------------|
| VS Code Extension | Real-time scanning in your editor |
| Discord/Slack Bot | `/scan` command in your server |
| Educational Content | Interactive vulnerability playground |
| Community Patterns | User-contributed vulnerability rules |

#### VS Code Extension 🔌

- Inline security warnings while coding
- Right-click → "Scan File for Vulnerabilities"
- Security score in status bar
- Quick fix suggestions in hover tooltips

#### Discord/Slack Bot 🤖

```
/scan https://github.com/user/repo
/scan-org myorganization
/security-report #weekly
```

---

## 📊 Competitive Differentiators

| Feature | VullScanny | Snyk | SonarQube |
|---------|-----------|------|-----------|
| Setup Time | 30 seconds | 15 mins | 1 hour |
| Beginner Friendly | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| AI-Powered Fixes | ✅ | ❌ | ❌ |
| Free Tier | Generous | Limited | Very Limited |
| Privacy First | ✅ No code storage | ❌ | ❌ |
| One-Click PRs | ✅ | ❌ | ❌ |
| Vibe Factor | 💯 | 😐 | 😴 |

---

## 💬 Community Engagement Ideas

1. **"Vulnerability of the Week"** blog series
2. **Security challenges** with prizes
3. **Developer interviews** about security
4. **Live scanning sessions** on Twitch/YouTube
5. **"Hall of Fame"** for contributors
6. **Meme-friendly branding** (security doesn't have to be boring!)

---

## 📊 Success Metrics

| Category | Metrics |
|----------|---------|
| Adoption | Active users, scans per day |
| Engagement | Fix rate, return rate |
| Learning | Tutorial completions, engagement time |
| Community | Pattern submissions, Discord members |
| Quality | False positive rate, accuracy |

---

## 📈 Future UX Improvements

- [ ] Dark/Light Theme Toggle
- [ ] Shareable Scan Reports
- [ ] Email Notifications
- [ ] Keyboard Shortcuts (S = scan, F = fix)
- [ ] Team Collaboration
- [ ] Scheduled Scans

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests: `npm test`
5. Build: `npm run build`
6. Submit PR

---

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ by the VullScanny Team**

*The vibe coding community wants tools that **empower**, **educate**, and **elevate** their work without slowing them down.*

*VullScanny has the foundation - now let's make it the tool every dev reaches for when they want to ship secure code fast!* 🛡️✨

*Last Updated: December 2024*
