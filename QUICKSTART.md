# 🚀 Quick Start Guide

Get VulnScany running in 5 minutes!

---

## Prerequisites

- Node.js 18+ installed
- GitHub account
- API keys from Ollama Cloud and Mistral AI

---

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Setup Script (Recommended)

```bash
./setup.sh
```

This interactive script will:
- Create `.env.local` from template
- Prompt for GitHub OAuth credentials
- Generate secure NEXTAUTH_SECRET
- Collect AI API keys
- Configure everything automatically

### 3. Manual Setup (Alternative)

If you prefer manual setup:

```bash
cp env.example .env.local
```

Then edit `.env.local` and fill in:

1. **GitHub OAuth** (from https://github.com/settings/developers):
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
   ```

2. **NEXTAUTH_SECRET** (generate with):
   ```bash
   openssl rand -base64 32
   ```

3. **AI API Keys**:
   ```env
   OLLAMA_API_KEYS=key1,key2,key3
   MISTRAL_API_KEYS=key1,key2
   ```

### 4. Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: VulnScany (or your choice)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. Save **Client ID** and **Client Secret**

### 5. Get AI API Keys

**Ollama Cloud:**
- Visit Ollama Cloud and create an account
- Generate API keys from dashboard
- Add to `.env.local`

**Mistral AI:**
- Visit https://console.mistral.ai
- Create account and navigate to API keys
- Generate keys and add to `.env.local`

### 6. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## First Scan

1. Click **Connect with GitHub**
2. Authorize the app
3. Select a React repository
4. Click **Scan**
5. Review vulnerabilities
6. Request AI fix suggestions

---

## Common Issues

### Port 3000 already in use

```bash
# Use different port
PORT=3001 npm run dev
```

### OAuth redirect error

Make sure your GitHub OAuth callback URL matches:
```
http://localhost:3000/api/auth/callback
```

### "API keys not configured"

Check that your `.env.local` has valid API keys for both Ollama and Mistral.

---

## Development Tips

### Check Environment Variables

```bash
# Verify .env.local is loaded
npm run dev | grep -i "env"
```

### Clear Cache

```bash
rm -rf .next
npm run dev
```

### Test with Sample Repo

Try scanning a simple React app first to ensure everything works.

---

## Next Steps

- Read [README.md](./README.md) for full documentation
- Review [Privacy Policy](http://localhost:3000/privacy)
- Deploy to Vercel (see README)

---

**Need help?** Check the troubleshooting section in README.md
