# Aeglyn Deployment Guide

## Quick Start

This repository contains two separate Next.js applications that deploy to different domains:

1. **Landing Page** (`aeglyn-landing/`) → `aeglyn.site`
2. **Application** (root) → `app.aeglyn.site`

## Prerequisites

- Node.js 18+
- Vercel account
- GitHub OAuth app configured
- API keys for Ollama/Mistral
- Upstash Redis instance

## Deployment Steps

### 1. Deploy Landing Page

```bash
cd aeglyn-landing
npm install
npm run build

# Deploy to Vercel
vercel --prod

# Configure domain in Vercel dashboard:
# aeglyn.site
```

**No environment variables needed** for the landing page (static site).

### 2. Deploy Application

```bash
# From root directory
npm install
npm run build

# Deploy to Vercel
vercel --prod

# Configure domain in Vercel dashboard:
# app.aeglyn.site
```

**Required Environment Variables** (set in Vercel dashboard):

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXTAUTH_URL=https://app.aeglyn.site
NEXTAUTH_SECRET=your_nextauth_secret

# AI Services (comma-separated for rotation)
OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=key1,key2

# Redis Cache (Highly Recommended)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Environment
NODE_ENV=production
```

### 3. Configure DNS

Point your domains to Vercel:

```
aeglyn.site          → Vercel (landing page project)
www.aeglyn.site      → Redirect to aeglyn.site
app.aeglyn.site      → Vercel (application project)
```

### 4. Update GitHub OAuth

Update your GitHub OAuth app settings:
- **Homepage URL**: `https://aeglyn.site`
- **Authorization callback URL**: `https://app.aeglyn.site/api/auth/callback`

## Local Development

### Landing Page
```bash
cd aeglyn-landing
npm install
npm run dev
# Opens on http://localhost:3000
```

### Application
```bash
# From root directory
npm install
cp env.example .env.local
# Edit .env.local with your local credentials
npm run dev
# Opens on http://localhost:3000
```

**Local Environment Variables** (`.env.local`):

```env
GITHUB_CLIENT_ID=your_dev_client_id
GITHUB_CLIENT_SECRET=your_dev_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_dev_client_id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_local_secret

OLLAMA_API_KEYS=your_ollama_keys
MISTRAL_API_KEYS=your_mistral_keys

UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

NODE_ENV=development
```

## Vercel Configuration

### Landing Page Project Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x
- **Root Directory**: `aeglyn-landing`

### Application Project Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x
- **Root Directory**: `./` (root)

## CI/CD

Both projects auto-deploy on push to main:

```bash
# Landing page changes
cd aeglyn-landing
git add .
git commit -m "Update landing page"
git push origin main
# Auto-deploys to aeglyn.site

# Application changes
git add .
git commit -m "Update application"
git push origin main
# Auto-deploys to app.aeglyn.site
```

## Monitoring

### Vercel Dashboard
- Check deployment logs
- Monitor build times
- View analytics
- Check error rates

### Application Monitoring
- Upstash Redis dashboard for cache metrics
- GitHub OAuth usage
- API rate limits

## Troubleshooting

### Build Failures

**Landing Page**:
```bash
cd aeglyn-landing
npm ci
npm run build
# Check for errors
```

**Application**:
```bash
npm ci
npm run build
# Check for errors
```

### Environment Variable Issues
1. Verify all required variables are set in Vercel
2. Check for typos in variable names
3. Ensure no trailing spaces in values
4. Verify URLs use correct protocol (http/https)

### OAuth Errors
1. Verify callback URL matches exactly
2. Check client ID and secret
3. Ensure NEXTAUTH_URL is correct
4. Test with a fresh incognito window

### Redis Connection Issues
1. Verify Upstash credentials
2. Check network connectivity
3. App works without Redis (degraded performance)

## Security Checklist

- [ ] All environment variables set in Vercel (not in code)
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] GitHub OAuth app restricted to production domain
- [ ] HTTPS enforced on both domains
- [ ] CORS configured correctly
- [ ] API rate limiting enabled
- [ ] Error logging configured
- [ ] Monitoring alerts set up

## Post-Deployment

1. **Test Landing Page**
   - Visit `https://aeglyn.site`
   - Check all links work
   - Verify branding is correct
   - Test mobile responsiveness

2. **Test Application**
   - Visit `https://app.aeglyn.site`
   - Test GitHub OAuth flow
   - Scan a test repository
   - Verify AI responses
   - Check cache is working

3. **Test Integration**
   - Click "Get Started" on landing page
   - Verify redirect to app works
   - Check navigation between sites
   - Test in multiple browsers

## Rollback Procedure

If deployment fails:

```bash
# Vercel dashboard → Deployments → Find last working deployment → Promote to Production
```

Or via CLI:
```bash
vercel rollback
```

## Support

For deployment issues:
1. Check Vercel build logs
2. Review environment variables
3. Test locally first
4. Check this guide for common issues

---

**Last Updated**: January 2026  
**Deployment Status**: Production Ready
