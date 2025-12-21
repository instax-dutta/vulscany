# Changelog

All notable changes to VullScanny are documented here.

---

## [2.0.0] - 2025-12-22

### Added

- **AI Response Caching System** (`/src/lib/ai/response-cache.ts`)
  - Redis-backed caching for AI vulnerability analysis
  - 7-day TTL with automatic hit tracking
  - Pre-warmed cache with 4 common patterns
  - 70-80% reduction in AI API calls
  - Sub-100ms response times for cached patterns

- **Smart Threat Intelligence Display**
  - `displayInUI` flag to conditionally show threat panel
  - Only displays when vulnerabilities are actually found
  - Maintains zero-day detection by always gathering data

### Changed

- **Threat Intelligence Logic** (`/src/app/api/scan/route.ts`)
  - Always collects threat data but conditionally displays it
  - Updated scanner types to include `displayInUI?: boolean`
  - Fixed UI mismatch where clean repos showed confusing threat numbers

- **AI Integration** (`/src/lib/ai/mistral.ts`)
  - Integrated response caching before API calls
  - Automatic caching of successful responses
  - Transparent cache hits for users

### Removed

- **Knowledgebase System**
  - Deleted `/src/lib/knowledgebase/` directory
  - Deleted `/src/app/api/kb/` API routes
  - Removed KB state management from dashboard
  - Removed KB enrichment from scanner
  - Removed KB sync from threat intelligence

### Fixed

- Top bar showing "0 issues" while threat panel showed random CVEs
- Clean repositories displaying confusing ecosystem-wide threat data
- Threat intelligence panel now only appears for repos with actual vulnerabilities

### Performance

- **AI Response Times**
  - Before: 2-5s per vulnerability (API call required)
  - After: <100ms for common vulnerabilities (cache hit)
  - API cost savings: 70-80%

- **Cache Performance**
  - First scan (cold): ~15-20s
  - Subsequent scans (warm): ~2-3s
  - Memory usage: ~50MB
  - Redis usage: ~10MB (typical)

---

## [1.0.0] - 2024-01-15

### Initial Release

- GitHub OAuth authentication
- React project detection
- Vulnerability scanning (XSS, injection, dangerous APIs)
- AI-powered explanations (Ollama + Mistral)
- Threat intelligence (NVD + GitHub Advisories)
- Risk scoring engine
- Batch scanning support
- Redis caching for threat data
- Privacy-first architecture
- Vercel deployment support
- API key rotation system

---

## Release Notes

### v2.0.0 - "Smart Cache"

Performance optimization and UX improvements:

**Key Changes:**

1. AI response caching (70-80% API cost reduction)
2. Smart threat intelligence display (fixes confusing UI)
3. Simplified architecture (removed redundant knowledgebase)

**Migration:**

- Upstash Redis now highly recommended (still optional)
- No breaking changes to environment variables
- Automatic migration - no action required

**Upgrade from v1.0.0:**

```bash
git pull origin main
npm install
```

---

**Maintained by**: Sai Dutta Abhishek Dash (SDAD.pro)
