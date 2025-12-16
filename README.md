# 🛡️ VullScanny

<div align="center">

**Privacy-First React Security Scanner with Advanced Threat Intelligence**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![VulkanorAI](https://img.shields.io/badge/Powered%20by-VulkanorAI-00ff88?style=for-the-badge)](https://sdad.pro)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

[🚀 Live Demo](https://vullscanny.sdad.pro) • [📖 Documentation](#documentation) • [🔐 Privacy Policy](#privacy--security)

</div>

---

## 🎯 What is VullScanny?

VullScanny is a **next-generation security scanner** for React applications that combines static analysis with real-time threat intelligence. Built for developers who care about security without compromising privacy.

### 🚀 **NEW: Advanced Threat Intelligence**

- ✨ **Real-time CVE Tracking** from NVD and GitHub Security Advisories
- ✨ **Zero-Day Detection** with continuous monitoring
- ✨ **Risk Scoring Engine** powered by VulkanorAI
- ✨ **Comprehensive Risk Analysis** with actionable recommendations

### Core Features

- 🔍 **Deep Security Scanning** - Detects XSS, injection, and React-specific vulnerabilities
- 🤖 **AI-Powered Analysis** - VulkanorAI explains threats in plain language
- 🛡️ **Threat Intelligence** - Real-time CVE database integration
- 📊 **Risk Assessment** - Multi-factor scoring (CVSS, exploits, dependency age)
- 🔒 **Privacy-First** - Your code is never stored, scans happen in memory
- ⚡ **Batch Scanning** - Scan multiple repositories in parallel
- 🎨 **Beautiful UI** - Modern cyber-tech aesthetic with smooth animations

---

## 📸 Screenshots

<div align="center">

### Dashboard with Threat Intelligence

![Dashboard](https://via.placeholder.com/800x400/0a0a0f/00ff88?text=VullScanny+Dashboard)

### Real-time Risk Analysis

![Risk Analysis](https://via.placeholder.com/800x400/0a0a0f/00ccff?text=Threat+Intelligence+Panel)

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **GitHub Account** for OAuth
- **API Keys**:
  - GitHub OAuth App credentials
  - Ollama Cloud API key(s)
  - Mistral Cloud API key(s) (optional)
  - Upstash Redis (optional, for caching)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/vullscanny.git
cd vullscanny
npm install
```

### 2. Set Up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: VullScanny
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. Save the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Create `.env.local`:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# For client-side GitHub login
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Ollama Cloud API Keys (comma-separated for rotation)
OLLAMA_API_KEYS=ollama_key1,ollama_key2,ollama_key3

# Mistral Cloud API Keys (comma-separated for rotation)
MISTRAL_API_KEYS=mistral_key1,mistral_key2

# Redis for Threat Intelligence Cache (Optional)
# Option 1: Upstash Redis (Recommended for Vercel/Serverless)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Option 2: Standard Redis (For traditional hosting)
# REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      VullScanny Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   GitHub     │  │  VulkanorAI  │  │   Threat     │     │
│  │   OAuth      │  │   Engine     │  │ Intelligence │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  Next.js App    │                        │
│                  │  (App Router)   │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         │                 │                 │              │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐       │
│  │   Scanner   │  │  AI Engine  │  │   Redis     │       │
│  │   Engine    │  │  (Ollama)   │  │   Cache     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server-side rendering, API routes |
| **Language** | TypeScript 5.0 | Type safety |
| **Styling** | Tailwind CSS + Custom CSS | Modern UI |
| **Auth** | GitHub OAuth | Secure authentication |
| **GitHub API** | Octokit (@octokit/rest) | Repository access |
| **AI Primary** | Ollama Cloud (gpt-oss:120b-cloud) | Vulnerability analysis |
| **AI Fallback** | Mistral Cloud | Backup AI provider |
| **Threat Intel** | NVD + GitHub Advisories | CVE tracking |
| **Cache** | Upstash Redis / In-memory | Performance optimization |
| **Animations** | Framer Motion | Smooth UI transitions |
| **Scrolling** | Lenis | Buttery smooth scrolling |
| **Hosting** | Vercel | Serverless deployment |

---

## 🔍 How It Works

### 1. Authentication Flow

```mermaid
sequenceDiagram
    User->>VullScanny: Click "Connect with GitHub"
    VullScanny->>GitHub: Redirect to OAuth
    GitHub->>User: Request permissions
    User->>GitHub: Authorize (read:user, repo)
    GitHub->>VullScanny: Redirect with code
    VullScanny->>GitHub: Exchange code for token
    GitHub->>VullScanny: Return access token
    VullScanny->>User: Set httpOnly cookie (2h)
    VullScanny->>User: Redirect to dashboard
```

### 2. Scanning Process

```mermaid
flowchart TD
    A[User selects repository] --> B[Fetch package.json]
    B --> C{Is React project?}
    C -->|No| D[Show error]
    C -->|Yes| E[Recursive file scan]
    E --> F[Pattern matching]
    F --> G[Threat intelligence lookup]
    G --> H[Risk calculation]
    H --> I[Generate report]
    I --> J[Display in browser]
    J --> K[Discard all data]
```

### 3. Threat Intelligence Pipeline

```
CVE Detection Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. Extract dependencies from package.json               │
│ 2. Query NVD API for React/npm CVEs                     │
│ 3. Query GitHub Security Advisories                     │
│ 4. Check Redis cache (24h TTL)                          │
│ 5. Calculate risk score (0-100)                         │
│ 6. Generate recommendations                             │
│ 7. Display threat intelligence panel                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Advanced Threat Intelligence

### Features

#### 🔍 Multi-Source CVE Integration

- **NVD (National Vulnerability Database)**: Comprehensive CVE data from NIST
- **GitHub Security Advisories**: npm package vulnerabilities
- **Smart Caching**: Redis-backed with automatic in-memory fallback
- **Rate Limit Handling**: Intelligent request throttling

#### 📊 Risk Analysis Engine

- **Multi-Factor Scoring**: CVSS scores, exploit availability, dependency age
- **Risk Levels**: LOW (0-24), MEDIUM (25-49), HIGH (50-74), CRITICAL (75-100)
- **VulkanorAI Integration**: AI-powered threat assessment
- **Actionable Recommendations**: Context-aware security guidance

#### 🔒 Privacy-First Design

- ✅ Only stores public CVE data (never user code)
- ✅ Optional Redis (works perfectly without it)
- ✅ In-memory fallback for zero-config deployment
- ✅ 24-hour TTL on all cached data
- ✅ Fully compliant with privacy policy

### API Endpoints

#### GET /api/threat-intel?action=latest

Fetch latest React ecosystem threats.

**Response:**

```json
{
  "cves": [...],
  "advisories": [...],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### GET /api/threat-intel?action=package&package=react&version=18.0.0

Get vulnerabilities for specific package.

**Response:**

```json
{
  "packageName": "react",
  "currentVersion": "18.0.0",
  "vulnerabilities": [...],
  "advisories": [...],
  "riskScore": 45,
  "recommendedVersion": "18.2.0"
}
```

#### POST /api/threat-intel

Analyze repository dependencies.

**Request:**

```json
{
  "dependencies": {
    "react": "18.0.0",
    "react-dom": "18.0.0"
  }
}
```

**Response:**

```json
{
  "riskScore": 65,
  "riskLevel": "HIGH",
  "cveMatches": [...],
  "advisoryMatches": [...],
  "recommendations": [...]
}
```

### Data Sources

| Source | URL | Rate Limit | Cost |
|--------|-----|------------|------|
| **NVD** | <https://nvd.nist.gov/> | 5 req/30s | Free |
| **GitHub Advisories** | <https://github.com/advisories> | 60 req/hour | Free |
| **OSV** | <https://osv.dev/> | Generous | Free |

### Caching Strategy

#### Redis Keys

- `nvd:react:recent:{limit}` - Latest React CVEs (6h TTL)
- `nvd:package:{packageName}` - Package CVEs (24h TTL)
- `github:advisories:react:{limit}` - Latest advisories (6h TTL)
- `github:advisory:{packageName}` - Package advisories (24h TTL)
- `threats:repo:{hash}` - Repository analysis (1h TTL)

#### Performance Benchmarks

- **First scan** (no cache): ~15-20s
- **Cached scan**: ~2-3s
- **Memory usage**: ~50MB (in-memory cache)
- **Redis usage**: ~10MB (typical)

---

## 📁 Project Structure

```
vullscanny/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── callback/route.ts      # OAuth callback
│   │   │   │   └── logout/route.ts        # Logout endpoint
│   │   │   ├── scan/route.ts              # Repository scanner
│   │   │   ├── batch-scan/route.ts        # Batch scanning
│   │   │   ├── threat-intel/route.ts      # Threat intelligence API
│   │   │   ├── repos/
│   │   │   │   └── react/route.ts         # React repo filter
│   │   │   └── ai/
│   │   │       ├── explain/route.ts       # AI explanations
│   │   │       └── generate-prompt/route.ts
│   │   ├── dashboard/page.tsx             # Main dashboard
│   │   ├── privacy/page.tsx               # Privacy policy
│   │   ├── page.tsx                       # Landing page
│   │   ├── layout.tsx                     # Root layout + metadata
│   │   ├── globals.css                    # Global styles
│   │   ├── icon.svg                       # Favicon
│   │   ├── apple-icon.png                 # Apple touch icon
│   │   ├── opengraph-image.png            # OG image
│   │   ├── robots.ts                      # Robots.txt
│   │   └── sitemap.ts                     # Sitemap
│   ├── components/
│   │   └── RepositoryList.tsx             # Repository list
│   └── lib/
│       ├── ai/
│       │   ├── ollama.ts                  # Ollama Cloud integration
│       │   ├── mistral.ts                 # Mistral Cloud integration
│       │   └── rotation.ts                # API key rotation
│       ├── cache/
│       │   └── index.ts                   # Caching system
│       ├── github/
│       │   ├── client.ts                  # GitHub API client
│       │   └── react-detector.ts          # React project detection
│       ├── scanner/
│       │   └── index.ts                   # Vulnerability scanner
│       └── threat-intel/
│           ├── types.ts                   # TypeScript interfaces
│           ├── redis-cache.ts             # Redis + in-memory cache
│           ├── cve-fetcher.ts             # NVD API integration
│           ├── github-advisories.ts       # GitHub Security API
│           ├── risk-analyzer.ts           # Risk scoring engine
│           └── index.ts                   # Main orchestrator
├── public/
│   ├── logo.png                           # App logo
│   ├── favicon.png                        # Favicon fallback
│   ├── apple-touch-icon.png               # iOS icon
│   └── manifest.json                      # PWA manifest
├── .env.local                             # Environment variables (gitignored)
├── env.example                            # Example environment file
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript config
├── tailwind.config.ts                     # Tailwind config
├── next.config.js                         # Next.js config
└── README.md                              # This file
```

---

## 🔐 Privacy & Security

### What We Do

✅ **Scan files in memory only** - No persistent storage  
✅ **Use OAuth short-lived tokens** - 2-hour expiration  
✅ **Discard data immediately** - After scan completion  
✅ **Cache only public CVE data** - Never user code  
✅ **Minimal AI context** - Only small code snippets  
✅ **Read-only GitHub access** - No write permissions  

### What We Never Do

❌ **Store source code** - Ever  
❌ **Keep GitHub tokens** - Beyond session  
❌ **Train AI on user data** - Your code stays private  
❌ **Share your information** - With anyone  
❌ **Track users** - No analytics or cookies beyond auth  

### Security Measures

- 🔒 **HttpOnly Cookies** - XSS protection
- 🔒 **Secure Cookies** - HTTPS only in production
- 🔒 **SameSite=Lax** - CSRF protection
- 🔒 **No Token Persistence** - Session-only storage
- 🔒 **Rate Limiting** - API abuse prevention
- 🔒 **Input Validation** - All user inputs sanitized

See our [Privacy Policy](https://vullscanny.sdad.pro/privacy) for full details.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

#### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Import to Vercel

- Go to [Vercel](https://vercel.com)
- Click **New Project**
- Import your GitHub repository

#### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_generated_secret

OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=key1,key2

# Optional: Upstash Redis for better performance
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

NODE_ENV=production
```

#### 4. Update GitHub OAuth

- Go to GitHub OAuth App settings
- Update **Homepage URL** to `https://your-domain.vercel.app`
- Update **Callback URL** to `https://your-domain.vercel.app/api/auth/callback`

#### 5. Deploy

Vercel automatically deploys on push to `main`

### Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `vullscanny.sdad.pro`)

2. **Update DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`

3. **Update Environment Variables**:

   ```env
   NEXTAUTH_URL=https://vullscanny.sdad.pro
   ```

4. **Update GitHub OAuth**:
   - Update callback URL to use custom domain

---

## 🔧 Configuration

### API Key Rotation

VullScanny supports multiple API keys for load distribution:

```env
OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=keyA,keyB
```

**Benefits:**

- ✅ Automatic fallback if a key is rate-limited
- ✅ Load distribution across keys
- ✅ 1-minute cooldown for failed keys
- ✅ Round-robin rotation

### Redis Configuration

#### Option 1: Upstash (Recommended for Serverless)

```env
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

**Why Upstash?**

- ✅ Serverless-friendly (REST API)
- ✅ No persistent connections
- ✅ Works in edge functions
- ✅ Free tier available

#### Option 2: Standard Redis

```env
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud
REDIS_URL=rediss://default:password@host:port
```

#### Option 3: No Redis (In-Memory Fallback)

Simply omit Redis variables. The system automatically uses in-memory caching.

---

## 🐛 Troubleshooting

### "Unauthorized" Error When Scanning

**Cause**: GitHub token expired or missing  
**Solution**:

1. Log out from dashboard
2. Log back in to refresh token
3. Check cookie settings in browser

### "AI Service Unavailable"

**Cause**: All API keys are rate-limited or invalid  
**Solution**:

1. Verify API keys are valid
2. Wait for rate limit reset (1 minute)
3. Add more API keys for rotation
4. Check API provider status

### "Not a React Project"

**Cause**: Repository doesn't have `react` in dependencies  
**Solution**:

1. Ensure `package.json` exists
2. Verify `react` is in dependencies
3. Check repository is not empty

### "No Threat Intelligence Data"

**Cause**: CVE APIs are down or rate-limited  
**Solution**:

1. System falls back gracefully
2. Check network connectivity
3. Verify rate limits (auto-handled)
4. Wait 30 seconds and retry

### "Redis Connection Failed"

**Cause**: Redis credentials invalid or server down  
**Solution**:

1. Automatic fallback to in-memory cache
2. No action needed!
3. Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### GitHub Rate Limit Exceeded

**Cause**: Too many API calls to GitHub  
**Solution**:

1. Wait for rate limit reset (shown in console)
2. Use authenticated requests (already implemented)
3. Reduce scan frequency

---

## 🎨 Customization

### Branding

Update branding in `src/app/layout.tsx`:

```typescript
const siteName = 'VullScanny';
const siteUrl = 'https://vullscanny.sdad.pro';
const siteDescription = 'Your custom description';
```

### Theme Colors

Edit `src/app/globals.css`:

```css
:root {
  --color-primary: #00ff88;    /* Neon green */
  --color-secondary: #00ccff;  /* Cyan */
  --color-danger: #ff0055;     /* Red */
  --color-warning: #ffaa00;    /* Orange */
}
```

### Logo & Icons

Replace files in `public/`:

- `logo.png` (512x512)
- `favicon.png` (64x64)
- `apple-touch-icon.png` (180x180)
- `src/app/icon.svg` (32x32 SVG)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
4. **Test thoroughly**:

   ```bash
   npm run build
   npm run dev
   ```

5. **Commit with conventional commits**:

   ```bash
   git commit -m "feat: add amazing feature"
   ```

6. **Push to your fork**:

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**

### Code Standards

- ✅ TypeScript strict mode
- ✅ ESLint compliance
- ✅ Prettier formatting
- ✅ Meaningful commit messages
- ✅ Documentation for new features

### Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

---

## 📊 Performance Optimization

### Lighthouse Scores (Target)

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Optimization Techniques

- ✅ Server-side rendering (SSR)
- ✅ Static generation where possible
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting
- ✅ Redis caching
- ✅ API response compression
- ✅ Lazy loading components

---

## 🔮 Roadmap

### Q1 2025

- [ ] Snyk API integration
- [ ] Custom CVE database
- [ ] Automated patch suggestions
- [ ] Dependency update automation

### Q2 2025

- [ ] Slack/Discord notifications
- [ ] Historical trend analysis
- [ ] Compliance reporting (SOC2, GDPR)
- [ ] Multi-language support

### Q3 2025

- [ ] VS Code extension
- [ ] GitHub Action integration
- [ ] CI/CD pipeline integration
- [ ] Team collaboration features

### Future

- [ ] Support for Vue.js, Angular
- [ ] Container scanning
- [ ] Infrastructure as Code scanning
- [ ] AI-powered auto-fixing

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Sai Dutta Abhishek Dash (SDAD.pro)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- Built with ❤️ by [Sai Dutta Abhishek Dash](https://sdad.pro)
- Powered by [VulkanorAI](https://sdad.pro) - Our in-house AI model
- CVE data from [NVD](https://nvd.nist.gov/) and [GitHub Security Advisories](https://github.com/advisories)
- AI providers: [Ollama Cloud](https://ollama.com) and [Mistral AI](https://mistral.ai)
- Icons and animations: Framer Motion, Emoji
- Smooth scrolling: [Lenis](https://github.com/studio-freight/lenis)

---

## 📧 Contact & Support

### General Inquiries

- **Website**: [vullscanny.sdad.pro](https://vullscanny.sdad.pro)
- **Author**: [Sai Dutta Abhishek Dash](https://sdad.pro)
- **GitHub**: [@saiduttaabhishekdash](https://github.com/saiduttaabhishekdash)

### Security Issues

If you discover a security vulnerability, please email:

- **Security**: <security@sdad.pro>

**Please do not** open public issues for security vulnerabilities.

### Privacy Concerns

- **Privacy**: <privacy@sdad.pro>

---

## 🌟 Star History

If you find VullScanny useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/vullscanny&type=Date)](https://star-history.com/#yourusername/vullscanny&Date)

---

<div align="center">

**Built by a security-focused, privacy-first engineering team** 🛡️

**Powered by VulkanorAI** 🤖

[🚀 Try VullScanny Now](https://vullscanny.sdad.pro) • [📖 Read the Docs](#documentation) • [💬 Get Support](#contact--support)

</div>
