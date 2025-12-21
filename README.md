# VullScanny - Internal Documentation

**Privacy-First React Security Scanner with AI-Powered Threat Intelligence**

Production URL: [vullscanny.sdad.pro](https://vullscanny.sdad.pro)

---

## 🌟 Overview

VullScanny is a proprietary SaaS platform that scans React applications for security vulnerabilities. It combines static analysis, AI-powered explanations, and real-time threat intelligence to help developers ship secure code fast.

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

### v2.1.0 - Vibe Coding Community Features (Dec 2025)

**Phase 1 Quick Wins - COMPLETED! ✅**

✅ **One-Click Fix Generation** (#1)

- Auto-generates PRs with security fixes
- Creates branch, commits changes, opens pull request
- Batch processing for multiple vulnerabilities
- Preview mode to review diffs before committing
- Privacy-first: Uses user's GitHub token

✅ **Copy-Paste Fix Snippets** (#2)

- Beautiful one-click copy button for fix suggestions
- Smooth animations and color transitions
- Visual feedback with checkmark
- Auto-resets after 2.5 seconds
- Mobile-friendly

✅ **Beginner-Friendly Onboarding** (#10)

- Interactive 7-step guided tour
- Personalized experience (asks for name and goals)
- Beautiful spring animations
- Progress bar and step indicators
- Skip option for power users
- Shows only once per user

✅ **Mobile-Responsive Dashboard** (#14)

- Comprehensive responsive CSS
- Tablet breakpoints (≤768px)
- Mobile breakpoints (≤480px)
- Touch-friendly interactions (min 44px buttons)
- Safe area support for notched devices
- Prevented iOS zoom on input focus

### v2.0.0 - Smart Cache (Dec 2025)

**AI Response Caching**

- Redis-backed caching for AI responses
- Instant analysis (<100ms) for common vulnerabilities
- 70-80% reduction in AI API costs
- Pre-warmed cache with 4 common patterns

**Smart Threat Intelligence**

- Fixed UI mismatch (clean repos showing random CVE data)
- Added `displayInUI` flag - only shows threats when vulnerabilities exist
- Maintains zero-day detection by always gathering data

**Architecture Cleanup**

- Removed redundant knowledgebase system
- Simplified codebase and deployment
- Better performance and maintainability

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- GitHub OAuth App credentials
- Ollama Cloud API keys
- Mistral AI API keys (optional fallback)
- Upstash Redis (highly recommended)

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

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# AI Services (comma-separated for rotation)
OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=key1,key2

# Redis (Highly Recommended for AI Caching)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

NODE_ENV=development
```

---

## 🏗️ Architecture

### System Flow

```
User Request
    ↓
GitHub OAuth Authentication
    ↓
Repository Scanner (Vulnerability Detection)
    ├─→ Check AI Cache (Redis)
    ├─→ AI Analysis (Ollama/Mistral)
    └─→ Threat Intelligence (NVD + GitHub)
    ↓
Risk Scoring Engine
    ↓
Dashboard UI (Results + Auto-Fix Options)
```

### Technology Stack

**Frontend:**

- Next.js 16 (App Router)
- React 19
- Framer Motion (animations)
- Lenis (smooth scrolling)
- React Markdown (rendering)

**Backend:**

- Next.js API Routes (serverless)
- GitHub Octokit (GitHub API)
- AI SDK (Mistral + Ollama)
- Upstash Redis (caching)

**Deployment:**

- Vercel (production hosting)
- Edge functions
- Automatic HTTPS
- Global CDN

---

## 🔍 Features Deep Dive

### 1. Security Scanning

**Vulnerability Detection:**

- XSS vulnerabilities (dangerouslySetInnerHTML)
- SSR injection attacks
- Markdown XSS patterns
- Dangerous API usage (eval, Function, etc.)
- Deprecated React versions
- High-risk dependencies

**Pattern Matching:**

- Regex-based static analysis
- Context-aware detection
- False positive reduction
- Line-accurate reporting

### 2. AI-Powered Analysis

**Caching System:**

- Smart hashing for similar issues
- 7-day TTL with automatic expiration
- Pre-warmed cache on startup
- Transparent cache hits
- 70-80% API cost reduction

**AI Providers:**

- Primary: Mistral AI
- Fallback: Ollama Cloud
- Automatic key rotation
- Rate limit handling

### 3. Auto-Fix PR Generation

**Workflow:**

1. User clicks "Auto-Fix: Create PR"
2. System fetches vulnerable files from GitHub
3. AI generates fixed code for each vulnerability
4. Creates new branch (e.g., `fix/security-vulnerabilities-1`)
5. Commits all fixes with descriptive messages
6. Opens pull request with detailed description
7. Shows success modal with PR link

**Privacy:**

- Uses user's GitHub token for all operations
- No code stored on VullScanny servers
- PR created directly in user's repository
- VullScanny acts as orchestrator only

**Features:**

- Batch processing (multiple fixes in one PR)
- Preview mode (show diffs before creating PR)
- Detailed commit messages per vulnerability
- Diff display in PR description

### 4. Copy-Paste Fix Snippets

**User Experience:**

- Beautiful gradient button after each AI fix suggestion
- One-click copy to clipboard
- Smooth color transition on click
- Checkmark animation for confirmation
- Hover effects for interactivity
- Subtitle: "ONE-CLICK COPY • PASTE INTO YOUR IDE"

### 5. Beginner-Friendly Onboarding

**7-Step Tour:**

1. **Welcome** - Introduction to VullScanny
2. **Get Name** - Personalization (with input validation)
3. **Select Goal** - Choose primary objective:
   - 🔍 Scan repositories
   - 📚 Learn about security
   - 🛠️ Auto-fix issues
   - 🌟 Just exploring
4. **Dashboard Overview** - Command center explanation
5. **Smart Scanning** - AI-powered detection features
6. **Auto-Fix Magic** - One-click PR generation
7. **Ready to Go!** - Personalized send-off

**Design:**

- Modern SaaS aesthetics
- Blurred dark backdrop with radial glow
- Glassmorphic modal design
- Gradient progress bar (green→cyan)
- Spring animations (damping: 25, stiffness: 300)
- Skip tour option
- Saves to localStorage (shows once only)

### 6. Mobile-Responsive Design

**Breakpoints:**

- Tablet: ≤768px
- Mobile: ≤480px
- Landscape tablets: optimized grid layouts

**Touch Optimizations:**

- Minimum 44px tap targets
- Disabled hover effects on touch devices
- Smooth scrolling with `-webkit-overflow-scrolling`
- iOS: Prevented zoom on input focus (16px minimum)
- Safe area support for notched devices

### 7. Threat Intelligence

**Data Sources:**

- NVD (National Vulnerability Database)
- GitHub Security Advisories
- CVSS scoring system

**Smart Display:**

- Only shows when vulnerabilities exist
- Always gathers data for zero-day detection
- Risk scoring: LOW, MEDIUM, HIGH, CRITICAL
- Actionable recommendations

---

## 📊 Performance

### AI Response Times

- **Before caching**: 2-5s per vulnerability
- **After caching**: <100ms for common vulnerabilities
- **First scan (cold)**: ~15-20s
- **Subsequent scans (warm)**: ~2-3s

### Resource Usage

- **Memory**: ~50MB typical usage
- **Redis**: ~10MB typical usage
- **API cost savings**: 70-80% with caching

---

## 🔒 Security & Privacy

### Privacy-First Architecture

**Code Handling:**

- ✅ Scanned in memory only
- ✅ Never stored on VullScanny servers
- ✅ Discarded immediately after scan
- ✅ No logging of user code

**GitHub Access:**

- ✅ OAuth with short-lived tokens (2-hour expiration)
- ✅ User controls all permissions
- ✅ Tokens stored in httpOnly cookies
- ✅ Secure, SameSite=Lax

**Data Storage:**

- ✅ Only caches public CVE data
- ✅ Anonymized AI response patterns
- ✅ No user code in Redis
- ✅ Automatic expiration (7 days)

### Security Measures

- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Environment variable protection
- Secure cookie handling
- HTTPS enforcement (production)

---

## 🧪 Testing

### Local Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Testing Auto-Fix PR Feature

1. **Single Vulnerability**
   - Scan a repo with 1 issue
   - Click "Auto-Fix: Create PR"
   - Verify PR is created
   - Check PR description and code changes

2. **Multiple Vulnerabilities**
   - Scan repo with 3-5 issues
   - Click "Auto-Fix: Create PR"
   - Verify all fixes in one PR
   - Check commit messages

3. **Error Handling**
   - Test with invalid repo
   - Test without GitHub permissions
   - Verify error messages

---

## 📦 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

### Environment Variables (Production)

Set these in Vercel dashboard:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXTAUTH_URL` (production domain)
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`
- `OLLAMA_API_KEYS`
- `MISTRAL_API_KEYS`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NODE_ENV=production`

### Build Configuration

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x

---

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**

- Ensure all environment variables are set
- Check Node.js version (18+)
- Clear `.next` folder and rebuild
- Run `npm ci` for clean install

**Redis Connection Issues:**

- Verify Upstash credentials
- Check network connectivity
- App works without Redis (degraded performance)

**GitHub OAuth Errors:**

- Verify OAuth app callback URL
- Check client ID and secret
- Ensure token hasn't expired

**AI API Errors:**

- Verify API keys are valid
- Check key rotation is working
- Monitor rate limits

---

## 📝 Changelog

### v2.1.0 (Dec 2025) - Vibe Coding Features

**Added:**

- ✅ One-click auto-fix PR generation
- ✅ Copy-paste fix snippets with beautiful UI
- ✅ Beginner-friendly onboarding (7-step tour)
- ✅ Mobile-responsive dashboard design
- ✅ Touch-optimized interactions

### v2.0.0 (Dec 2025) - Smart Cache

**Added:**

- AI response caching system (Redis)
- Smart threat intelligence display
- Pre-warmed cache with common patterns

**Changed:**

- Improved threat intelligence logic
- Optimized AI integration

**Removed:**

- Knowledgebase system (redundant)

**Fixed:**

- UI mismatch on clean repositories
- Performance bottlenecks in AI calls

### v1.0.0 (Jan 2024) - Initial Release

**Features:**

- GitHub OAuth authentication
- React vulnerability scanning
- AI-powered explanations
- Threat intelligence integration
- Risk scoring engine
- Batch scanning support
- Privacy-first architecture

---

## 🔮 Roadmap

See [VIBE_CODING_ROADMAP.md](./VIBE_CODING_ROADMAP.md) for detailed feature plans.

**Phase 2: Core Features (Next) - 1 month**

- 🚧 CLI tool (#8)
- 🚧 GitHub Action integration (#5)
- 🚧 Security score dashboard (#6)

**Phase 3: Advanced (Future) - 2-3 months**

- 🎯 VS Code extension (#3)
- 🎯 Discord/Slack bot (#4)
- 🎯 Educational content (#7)
- 🎯 Community vulnerability patterns (#9)

---

## 📄 License

Proprietary - All rights reserved.

**Maintained by**: Sai Dutta Abhishek Dash (SDAD.pro)

---

## 🤝 Internal Team

For internal development questions or deployment support, contact the development team.

**Production Monitoring**: [vullscanny.sdad.pro](https://vullscanny.sdad.pro)

---

## 🎨 Design Philosophy

**For Vibe Coders:**

1. **Fast** - Results in seconds, not minutes
2. **Clear** - No jargon, plain English
3. **Actionable** - Show the fix, not a thesis
4. **Fun** - Beautiful animations and delightful UX
5. **Accessible** - Beginner to expert, all welcome

**UI Principles:**

- Modern SaaS aesthetics
- Smooth animations (Framer Motion)
- Dark theme with vibrant accents
- Monospace fonts for code
- Glassmorphism and gradients
- Mobile-first responsive design
