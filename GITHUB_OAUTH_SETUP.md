# GitHub OAuth Setup Guide for Aeglyn

This guide will help you create a new GitHub OAuth application for Aeglyn.

## Why Create a New OAuth App?

Since we've rebranded from VullScanny to Aeglyn, you should create a new GitHub OAuth application to:
- Match the new branding
- Use the new domain (`app.example.com`)
- Keep everything clean and professional

## Step-by-Step Setup

### 1. Go to GitHub OAuth Apps

1. Open your browser and go to: https://github.com/settings/developers
2. Click on **"OAuth Apps"** in the left sidebar
3. Click the **"New OAuth App"** button

### 2. Fill in Application Details

**Application name:**
```
Aeglyn
```

**Homepage URL:**
```
https://example.com
```

**Application description:**
```
Privacy-First AI Code Security Scanner - Secure your vibe coding with zero-knowledge static analysis
```

**Authorization callback URL:**
```
https://app.example.com/api/auth/callback
```

For local development, you can also add:
```
http://localhost:3000/api/auth/callback
```

### 3. Register the Application

Click **"Register application"**

### 4. Get Your Credentials

After registration, you'll see:
- **Client ID** - Copy this
- **Client secrets** - Click "Generate a new client secret" and copy it immediately (you won't see it again!)

### 5. Update Environment Variables

#### For Local Development

Update your `.env.local` file:

```env
# GitHub OAuth - Aeglyn
GITHUB_CLIENT_ID=your_new_client_id_here
GITHUB_CLIENT_SECRET=your_new_client_secret_here
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_new_client_id_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# AI Services (keep existing)
OLLAMA_API_KEYS=your_ollama_keys
MISTRAL_API_KEYS=your_mistral_keys

# Redis (keep existing)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

NODE_ENV=development
```

#### For Production (Vercel)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (vulscany → will deploy to app.example.com)
3. Go to **Settings** → **Environment Variables**
4. Update these variables:

```
GITHUB_CLIENT_ID = your_new_client_id_here
GITHUB_CLIENT_SECRET = your_new_client_secret_here
NEXT_PUBLIC_GITHUB_CLIENT_ID = your_new_client_id_here
NEXTAUTH_URL = https://app.example.com
```

Keep your existing:
- `NEXTAUTH_SECRET`
- `OLLAMA_API_KEYS`
- `MISTRAL_API_KEYS`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NODE_ENV=production`

### 6. Generate NEXTAUTH_SECRET (if needed)

If you need a new `NEXTAUTH_SECRET`, run this in PowerShell:

```powershell
# Generate a random 32-character secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use this online tool: https://generate-secret.vercel.app/32

### 7. Test the OAuth Flow

#### Local Testing

1. Start your dev server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. Click "Connect with GitHub"
4. You should be redirected to GitHub
5. Authorize the app
6. You should be redirected back to your dashboard

#### Production Testing

1. Deploy to Vercel (or it auto-deploys on push)
2. Visit https://app.example.com
3. Click "Connect with GitHub"
4. Authorize the app
5. Verify you're redirected back successfully

## Troubleshooting

### "The redirect_uri MUST match the registered callback URL"

**Problem**: The callback URL doesn't match what you registered.

**Solution**:
1. Check your GitHub OAuth app settings
2. Make sure the callback URL is exactly: `https://app.example.com/api/auth/callback`
3. For local dev, add: `http://localhost:3000/api/auth/callback`

### "Bad verification code"

**Problem**: The OAuth flow was interrupted or the code expired.

**Solution**:
1. Clear your browser cookies
2. Try the login flow again
3. Make sure your `NEXTAUTH_SECRET` is set correctly

### "NEXTAUTH_URL is not set"

**Problem**: Missing environment variable.

**Solution**:
1. Add `NEXTAUTH_URL` to your environment variables
2. Local: `http://localhost:3000`
3. Production: `https://app.example.com`

### OAuth works locally but not in production

**Problem**: Environment variables not set in Vercel.

**Solution**:
1. Go to Vercel → Settings → Environment Variables
2. Make sure all variables are set for "Production"
3. Redeploy your application

## Security Best Practices

✅ **Never commit secrets to Git**
- Keep `.env.local` in `.gitignore`
- Use Vercel's environment variables for production

✅ **Use different OAuth apps for dev and production**
- Optional but recommended
- Keeps your production app secure during development

✅ **Rotate secrets periodically**
- Generate new client secrets every few months
- Update in both local and production environments

✅ **Limit OAuth scopes**
- Only request the permissions you need
- Current scopes: `read:user repo`

## What Happens After OAuth?

1. User clicks "Connect with GitHub"
2. Redirected to GitHub authorization page
3. User authorizes Aeglyn
4. GitHub redirects back with a code
5. Aeglyn exchanges code for access token
6. Token is stored in secure httpOnly cookie
7. User can now scan their repositories

## OAuth App Settings Summary

| Setting | Value |
|---------|-------|
| **Name** | Aeglyn |
| **Homepage** | https://example.com |
| **Callback** | https://app.example.com/api/auth/callback |
| **Scopes** | read:user, repo |

## Quick Checklist

Before going live, verify:

- [ ] GitHub OAuth app created with "Aeglyn" name
- [ ] Homepage URL set to `https://example.com`
- [ ] Callback URL set to `https://app.example.com/api/auth/callback`
- [ ] Client ID copied
- [ ] Client secret generated and copied
- [ ] Environment variables updated in Vercel
- [ ] `NEXTAUTH_URL` set to `https://app.example.com`
- [ ] Application redeployed
- [ ] OAuth flow tested and working
- [ ] Old VullScanny OAuth app can be deleted (optional)

## Need Help?

If you run into issues:
1. Check the browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Test locally first before deploying to production

---

**Ready to set up?** Follow the steps above and you'll have GitHub OAuth working with Aeglyn in minutes! 🚀
