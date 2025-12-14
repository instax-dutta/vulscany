# 🚢 Deployment Checklist

Complete this checklist before deploying VulnScany to production.

---

## Pre-Deployment

### 1. Environment Variables

- [ ] All environment variables are configured in Vercel
- [ ] `GITHUB_CLIENT_ID` set
- [ ] `GITHUB_CLIENT_SECRET` set
- [ ] `NEXT_PUBLIC_GITHUB_CLIENT_ID` set (matches GITHUB_CLIENT_ID)
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` generated securely
- [ ] `OLLAMA_API_KEYS` configured (multiple keys for rotation)
- [ ] `MISTRAL_API_KEYS` configured (multiple keys for rotation)
- [ ] `NODE_ENV` set to `production`

### 2. GitHub OAuth App

- [ ] Create **production** GitHub OAuth App (separate from dev)
- [ ] Set **Homepage URL** to: `https://your-domain.com`
- [ ] Set **Callback URL** to: `https://your-domain.com/api/auth/callback`
- [ ] Update Client ID and Secret in Vercel environment variables

### 3. Code Review

- [ ] All console.log statements removed or conditional
- [ ] Error handling is production-ready
- [ ] No sensitive data in code
- [ ] API key rotation is working
- [ ] Caching is properly configured

### 4. Testing

- [ ] Test OAuth flow locally
- [ ] Test repository scanning locally
- [ ] Test AI explanations locally
- [ ] Test logout functionality
- [ ] Test error states
- [ ] Test on mobile viewport

### 5. Security

- [ ] `.env.local` is in `.gitignore` ✅
- [ ] No API keys in source code ✅
- [ ] httpOnly cookies enabled ✅
- [ ] CORS configured properly
- [ ] Rate limiting considered
- [ ] No sensitive data in logs ✅

---

## Vercel Deployment

### 1. Connect Repository

```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
GITHUB_CLIENT_ID=<production_value>
GITHUB_CLIENT_SECRET=<production_value>
NEXT_PUBLIC_GITHUB_CLIENT_ID=<production_value>
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate_new_for_production>
OLLAMA_API_KEYS=<your_keys>
MISTRAL_API_KEYS=<your_keys>
NODE_ENV=production
```

### 4. Deploy

Click **Deploy** and wait for build to complete.

### 5. Verify Deployment

- [ ] Homepage loads correctly
- [ ] Privacy page accessible
- [ ] GitHub OAuth works
- [ ] Can view repositories
- [ ] Can scan a repository
- [ ] AI explanations work
- [ ] Logout works
- [ ] No console errors

---

## Post-Deployment

### 1. Update Documentation

- [ ] Update README with production URL
- [ ] Update privacy policy with contact info
- [ ] Add actual support email

### 2. Monitoring

- [ ] Set up Vercel Analytics
- [ ] Monitor error logs in Vercel
- [ ] Check API usage (Ollama, Mistral)
- [ ] Monitor GitHub API rate limits

### 3. Domain Configuration (Optional)

If using custom domain:

1. Add domain in Vercel
2. Configure DNS records
3. Update GitHub OAuth callback URL
4. Update `NEXTAUTH_URL` in environment variables

---

## Production Environment Variables Template

```env
# GitHub OAuth (Production)
GITHUB_CLIENT_ID=Iv1.YOUR_PRODUCTION_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_PRODUCTION_SECRET
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.YOUR_PRODUCTION_CLIENT_ID

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate_with_openssl_rand_base64_32>

# AI API Keys (Production - Use Separate Keys)
OLLAMA_API_KEYS=prod_key1,prod_key2,prod_key3
MISTRAL_API_KEYS=prod_keyA,prod_keyB

# Environment
NODE_ENV=production
```

---

## Rollback Plan

If deployment fails:

1. **Revert deployment** in Vercel dashboard
2. Check error logs
3. Fix issues locally
4. Test thoroughly
5. Redeploy

---

## Security Reminders

- ✅ Never commit `.env.local` or `.env.production`
- ✅ Use different API keys for production
- ✅ Rotate keys periodically
- ✅ Monitor for unusual activity
- ✅ Keep dependencies updated

---

## Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images (if any)
- [ ] Enable compression
- [ ] Monitor bundle size

---

## Support Setup

After deployment, set up:

- [ ] Support email (e.g., support@your-domain.com)
- [ ] Privacy email (e.g., privacy@your-domain.com)
- [ ] Status page (optional)
- [ ] Feedback form (optional)

---

## Final Checklist

- [ ] App is live and accessible
- [ ] OAuth flow works end-to-end
- [ ] Scanning works correctly
- [ ] AI features functional
- [ ] Error states handled gracefully
- [ ] Privacy policy is accurate
- [ ] All environment variables secure
- [ ] No sensitive data exposed
- [ ] Monitoring in place
- [ ] Team has access to Vercel dashboard

---

**🎉 Deployment Complete!**

Monitor the app for the first 24 hours and address any issues promptly.
