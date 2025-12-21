# VullScanny - Internal Documentation

**Privacy-First React Security Scanner with Advanced Threat Intelligence**

Production URL: [vullscanny.sdad.pro](https://vullscanny.sdad.pro)

---

## Overview

VullScanny is a proprietary SaaS platform for scanning React applications for security vulnerabilities. It combines static analysis with real-time threat intelligence and AI-powered analysis.

### Key Features

- 🔍 **Deep Security Scanning** - XSS, injection, and React-specific vulnerabilities
- 🤖 **AI-Powered Analysis** - Instant explanations with Redis caching (70-80% API cost reduction)
- 🛡️ **Threat Intelligence** - Real-time CVE data from NVD and GitHub
- 📊 **Risk Assessment** - CVSS-based scoring with multi-factor analysis
- 🔒 **Privacy-First** - Zero code storage, memory-only scanning
- ⚡ **Batch Scanning** - Multi-repository parallel processing

---

## Latest Updates (Dec 2025)

### v2.0.0 - Performance & UX Improvements

**AI Response Caching**

- Implemented Redis-backed caching for AI responses
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

## Development Setup

### Prerequisites

- Node.js 18+
- GitHub OAuth App credentials
- Ollama Cloud API keys
- Mistral AI API keys (optional fallback)
- Upstash Redis (highly recommended)

### Local Installation

```bash
git clone <repository-url>
cd vullscany
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

# Redis (Highly Recommended)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

NODE_ENV=development
```

---

## Architecture

### System Flow

```
Scan Request
    ↓
Repository Scanner (Vulnerability Detection)
    ↓
Threat Intelligence (Always Gathered)
  • Fetches CVE data from NVD
  • Checks GitHub Security Advisories
  • Cached in Redis (6-12h TTL)
  • displayInUI flag set if vulnerabilities found
    ↓
AI Analysis (With Smart Caching)
  1. Check Redis Cache
  2. If HIT → Return instantly (<100ms)
  3. If MISS → Call API, cache response (7d TTL)
    ↓
Dashboard Display
  • Scan results
  • Threat intelligence (only if vulnerabilities exist)
  • AI analysis with cache hits
```

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.0
- **Auth**: GitHub OAuth
- **AI**: Ollama Cloud (primary), Mistral (fallback)
- **Threat Intel**: NVD + GitHub Security Advisories
- **Cache**: Upstash Redis + in-memory fallback
- **Hosting**: Vercel

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # OAuth flow
│   │   ├── scan/          # Repository scanning
│   │   ├── threat-intel/  # CVE & advisory data
│   │   └── ai/            # AI analysis endpoints
│   ├── dashboard/         # Main UI
│   └── privacy/           # Privacy policy
├── lib/
│   ├── ai/
│   │   ├── ollama.ts          # Ollama integration
│   │   ├── mistral.ts         # Mistral integration
│   │   └── response-cache.ts  # ⭐ AI caching system
│   ├── scanner/               # Vulnerability detection
│   └── threat-intel/          # CVE/advisory fetching
```

---

## Deployment

### Vercel Deployment

1. **Push to Repository**

   ```bash
   git push origin main
   ```

2. **Configure Vercel**
   - Import project
   - Add all environment variables
   - Set production domain

3. **Update GitHub OAuth**
   - Homepage URL: `https://vullscanny.sdad.pro`
   - Callback URL: `https://vullscanny.sdad.pro/api/auth/callback`

4. **Deploy**
   - Automatic deployment on push to `main`

### Environment Variables (Production)

```env
GITHUB_CLIENT_ID=prod_client_id
GITHUB_CLIENT_SECRET=prod_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=prod_client_id
NEXTAUTH_URL=https://vullscanny.sdad.pro
NEXTAUTH_SECRET=production_secret
OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=key1,key2
UPSTASH_REDIS_REST_URL=https://prod-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=prod_token
NODE_ENV=production
```

---

## Performance Benchmarks

### With Redis Caching

- **First scan** (cold cache): ~15-20s
- **Subsequent scans** (warm cache): ~2-3s
- **AI analysis** (cache hit): <100ms
- **AI analysis** (cache miss): 2-5s

### API Cost Savings

- **Before v2.0**: 100% of vulnerabilities → AI API call
- **After v2.0**: 20-30% of vulnerabilities → AI API call
- **Savings**: 70-80% reduction in AI costs

---

## Configuration

### API Key Rotation

Multiple keys are automatically rotated:

```env
OLLAMA_API_KEYS=key1,key2,key3  # Round-robin rotation
MISTRAL_API_KEYS=keyA,keyB      # 1-minute cooldown on failures
```

### Redis Options

**Option 1: Upstash (Recommended)**

- Serverless-friendly REST API
- No persistent connections
- Free tier available

**Option 2: Standard Redis**

```env
REDIS_URL=redis://localhost:6379
```

**Option 3: No Redis**

- Automatic in-memory fallback
- AI caching won't persist across restarts

---

## Troubleshooting

### "Unauthorized" Error

- **Cause**: GitHub token expired
- **Fix**: Log out and log back in

### "AI Service Unavailable"

- **Cause**: All API keys rate-limited
- **Fix**: Wait 1 minute or add more keys

### Slow AI Responses

- **Cause**: Redis not configured
- **Fix**: Add Upstash credentials

### "No Threat Intelligence Data"

- **Cause**: CVE APIs down/rate-limited
- **Fix**: System auto-retries, wait 30s

---

## Privacy & Security

### What We Do

✅ Scan in memory only (no storage)
✅ 2-hour OAuth token expiration
✅ Immediate data disposal after scan
✅ Cache only public CVE data
✅ Read-only GitHub access

### What We Never Do

❌ Store source code
❌ Keep GitHub tokens beyond session
❌ Train AI on user code
❌ Share user data
❌ Track users (beyond auth)

### Security Measures

- HttpOnly + Secure cookies
- SameSite=Lax (CSRF protection)
- Rate limiting on all APIs
- Input validation and sanitization

---

## Development Notes

### AI Caching System

Located in `/src/lib/ai/response-cache.ts`:

**Cache Key Format**: `ai:response:{issueType}:{fileExtension}`

**Pre-cached Patterns**:

1. `dangerous-api` - XSS via dangerouslySetInnerHTML
2. `xss-vulnerable-attribute` - XSS via href/src
3. `eval-usage` - Code execution vulnerabilities
4. `outdated-dependency` - Dependency issues

**Monitoring**:

```typescript
import { getAICacheStats } from '@/lib/ai/response-cache';
const stats = await getAICacheStats();
console.log(`Cache entries: ${stats.totalEntries}`);
console.log(`Most popular: `, stats.mostPopular);
```

### Threat Intelligence

**Data Sources**:

- NVD (National Vulnerability Database)
- GitHub Security Advisories
- OSV.dev

**Caching**:

- CVE data: 6-12 hour TTL
- Advisory data: 6-12 hour TTL
- Repository analysis: 1 hour TTL

**Display Logic**:

- Always gathers threat data (zero-day detection)
- Only displays if `scanResult.vulnerabilities.length > 0`
- Controlled by `displayInUI` flag

---

## Roadmap

### Q1 2025

- [ ] Snyk API integration
- [ ] Custom CVE database
- [ ] Automated patch suggestions
- [x] AI response caching
- [x] Smart threat intelligence

### Q2 2025

- [ ] Notification system (Slack/Discord)
- [ ] Historical trend analysis
- [ ] Compliance reporting
- [ ] Multi-language support

### Future

- [ ] VS Code extension
- [ ] GitHub Actions integration
- [ ] Support for Vue.js, Angular
- [ ] AI-powered auto-fixing

---

## Contact

- **Author**: Sai Dutta Abhishek Dash
- **Website**: [sdad.pro](https://sdad.pro)
- **Production**: [vullscanny.sdad.pro](https://vullscanny.sdad.pro)

---

**Last Updated**: December 2025 (v2.0.0)
