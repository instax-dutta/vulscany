# Aeglyn Integration Guide

## Overview

**Aeglyn** is the public-facing brand for our React security scanner. Internally, the project is developed under the codename **VulScany** to maintain development continuity while presenting a polished brand to users.

## Dual Deployment Architecture

### 1. Landing Page (Marketing Site)
- **Repository**: `aeglyn-landing/` (cloned from instax-dutta/aeglyn-landing-v1)
- **Deployment**: Vercel → `aeglyn.site`
- **Purpose**: Marketing, features, pricing, and user acquisition
- **Tech Stack**: Next.js with shadcn/ui components
- **Color Scheme**: Aeglyn Cyan (oklch(0.7 0.1 220))

### 2. Application (Product)
- **Repository**: Root directory (this repo)
- **Deployment**: Vercel → `app.aeglyn.site`
- **Purpose**: Actual security scanning application
- **Tech Stack**: Next.js 16, React 19, AI SDK
- **Color Scheme**: Updated to match Aeglyn Cyan theme

## Branding Strategy

### Public-Facing (Aeglyn)
- All user-visible text, UI, and marketing materials use "Aeglyn"
- Logo and branding assets from landing page
- Consistent cyan color scheme across both sites
- Professional, privacy-focused messaging

### Internal Development (VulScany)
- Code references, internal docs, and development artifacts
- Package name remains "vulscany" for stability
- Git repository structure unchanged
- Development environment variables

## Color Scheme Unification

### Aeglyn Brand Colors
```css
/* Primary Cyan */
--color-primary: #00d4ff;
--color-primary-dark: #00a8cc;
--color-primary-light: #66e5ff;

/* Gradients */
background: linear-gradient(135deg, #00d4ff 0%, #00ffc8 100%);

/* OKLCH (Landing Page) */
--primary: oklch(0.7 0.1 220);
```

### Updated Application Colors
- ✅ Gradient text: Blue-purple → Cyan-teal
- ✅ Hover effects: Blue glow → Cyan glow
- ✅ Scrollbar: Blue → Cyan
- ✅ Security badge animations: Blue → Cyan

## Deployment Configuration

### Landing Page Deployment
```bash
cd aeglyn-landing
npm install
npm run build
vercel --prod
# Set domain: aeglyn.site
```

**Environment Variables** (Vercel):
- None required for static landing page
- Optional: Analytics, form endpoints

### Application Deployment
```bash
# Root directory
npm install
npm run build
vercel --prod
# Set domain: app.aeglyn.site
```

**Environment Variables** (Vercel):
```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
NEXTAUTH_URL=https://app.aeglyn.site
NEXTAUTH_SECRET=your_secret

# AI Services
OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=key1,key2

# Redis Cache
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

NODE_ENV=production
```

## Cross-Site Integration

### Landing Page → App Links
Update landing page CTAs to point to app:
```tsx
// In aeglyn-landing components
<Link href="https://app.aeglyn.site">Get Started</Link>
<Link href="https://app.aeglyn.site/dashboard">Dashboard</Link>
```

### App → Landing Page Links
```tsx
// In app components
<Link href="https://aeglyn.site">Home</Link>
<Link href="https://aeglyn.site/features">Features</Link>
<Link href="https://aeglyn.site/pricing">Pricing</Link>
```

### Shared Navigation
Consider creating a shared navigation component that works across both sites:
- Logo links to landing page
- "Dashboard" links to app
- "Features", "Pricing" link to landing page sections

## Development Workflow

### Local Development

**Landing Page**:
```bash
cd aeglyn-landing
npm run dev
# Runs on http://localhost:3000
```

**Application**:
```bash
# Root directory
npm run dev
# Runs on http://localhost:3000
# (Stop landing page dev server first)
```

### Testing Integration
1. Deploy landing page to Vercel preview
2. Deploy app to Vercel preview
3. Test cross-site navigation
4. Verify branding consistency
5. Check color scheme matching

## Branding Checklist

### ✅ Completed
- [x] Color scheme updated to Aeglyn Cyan
- [x] Landing page cloned and integrated
- [x] README updated with Aeglyn branding
- [x] Main page.tsx updated with Aeglyn name
- [x] Gradient colors updated throughout

### 🚧 TODO
- [ ] Update all component files with Aeglyn branding
- [ ] Create shared logo/assets directory
- [ ] Set up cross-site analytics
- [ ] Configure CORS for API calls if needed
- [ ] Update meta tags and SEO
- [ ] Create deployment scripts
- [ ] Set up CI/CD for both deployments
- [ ] Add environment-based branding (dev vs prod)

## File Structure

```
vulscany/
├── aeglyn-landing/          # Marketing site (separate deployment)
│   ├── app/
│   ├── components/
│   ├── public/
│   └── styles/
├── src/                     # Application code
│   ├── app/
│   │   ├── page.tsx        # App landing/login
│   │   ├── dashboard/      # Main app interface
│   │   └── globals.css     # Updated with Aeglyn colors
│   └── components/
├── public/
├── package.json            # App dependencies
└── README.md              # Updated with Aeglyn branding
```

## Domain Configuration

### DNS Setup
```
aeglyn.site          → Vercel (landing page)
www.aeglyn.site      → Redirect to aeglyn.site
app.aeglyn.site      → Vercel (application)
```

### SSL/HTTPS
- Automatic via Vercel
- Both sites use HTTPS by default
- Ensure all cross-site links use HTTPS

## SEO Considerations

### Landing Page
- Title: "Aeglyn - AI-Powered React Security Scanner"
- Description: "Privacy-first vulnerability detection for React applications"
- Keywords: React security, vulnerability scanner, AI security

### Application
- Title: "Aeglyn Dashboard - Scan Your React Apps"
- Description: "Secure your React applications with AI-powered vulnerability detection"
- Robots: Allow indexing of public pages only

## Migration Notes

### From VullScanny to Aeglyn
1. **User Communication**: Notify existing users of rebrand
2. **Domain Redirect**: Set up vullscanny.sdad.pro → app.aeglyn.site
3. **Data Migration**: No user data stored, so no migration needed
4. **OAuth Update**: Update GitHub OAuth app callback URLs
5. **Analytics**: Update tracking codes and domains

### Backward Compatibility
- Keep old environment variables working
- Maintain API endpoint structure
- Preserve user sessions during transition

## Monitoring

### Landing Page
- Vercel Analytics
- Google Analytics (optional)
- Uptime monitoring

### Application
- Vercel Analytics
- Error tracking (Sentry recommended)
- API usage monitoring
- Redis cache metrics

## Support

### Internal Development
- Use "VulScany" in internal communications
- Code comments can reference either name
- Git commits use descriptive messages

### User-Facing
- Always use "Aeglyn" in:
  - UI text
  - Error messages
  - Email communications
  - Documentation
  - Support responses

## Next Steps

1. **Deploy Landing Page**
   ```bash
   cd aeglyn-landing
   vercel --prod
   ```

2. **Update App Domain**
   ```bash
   # Update NEXTAUTH_URL in Vercel
   # Redeploy app
   vercel --prod
   ```

3. **Test Integration**
   - Verify cross-site navigation
   - Check color consistency
   - Test OAuth flow with new domain
   - Validate SSL certificates

4. **Update External Services**
   - GitHub OAuth app settings
   - API provider whitelists
   - Analytics properties
   - Domain registrar settings

## Troubleshooting

### Color Mismatch
- Check CSS variables in both projects
- Verify Tailwind config matches
- Use browser dev tools to inspect computed colors

### Cross-Site Issues
- Check CORS headers
- Verify domain configuration
- Test in incognito mode
- Clear browser cache

### Deployment Failures
- Check build logs in Vercel
- Verify environment variables
- Test build locally first
- Check Node.js version compatibility

---

**Last Updated**: January 2026  
**Maintained By**: Development Team
