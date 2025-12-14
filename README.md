# 🛡️ VulnScany

**Privacy-First React Security Scanner for Developers**

VulnScany helps beginners and non-technical users keep their React projects free from vulnerabilities. We scan your GitHub repositories for security issues and explain them in plain, friendly language—without ever storing your code.

---

## 🎯 What is VulnScany?

VulnScany is a web application that:

* Connects securely to your GitHub account
* Detects React projects
* Scans for common vulnerabilities (XSS, injection, dangerous APIs)
* Explains risks in beginner-friendly language
* Suggests AI-powered fixes
* **Never stores your source code or tokens**

---

## 🚀 Features

### Core Functionality
- ✅ **GitHub OAuth Integration** - Secure, read-only access
- ✅ **React Project Detection** - Automatically identifies React apps
- ✅ **Security Scanning** - Detects XSS, SSR injection, dangerous APIs
- ✅ **AI Explanations** - Beginner-friendly vulnerability explanations
- ✅ **Fix Suggestions** - AI-generated patches using Ollama Cloud & Mistral

### Privacy & Security
- 🔒 **Zero Long-term Storage** - Code scanned in memory only
- 🔒 **No Token Persistence** - OAuth tokens expire after 2 hours
- 🔒 **Client-Side Processing** - Results stay in your browser
- 🔒 **Minimal AI Context** - Only small snippets sent to AI providers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Auth** | GitHub OAuth |
| **GitHub API** | Octokit |
| **AI Primary** | Ollama Cloud API |
| **AI Fallback** | Mistral Cloud API |
| **Hosting** | Vercel (Hobby plan compatible) |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- GitHub account
- GitHub OAuth App credentials
- Ollama Cloud API key(s)
- Mistral Cloud API key(s)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd vulscany
npm install
```

### 2. Set Up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: VulnScany
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. Save the **Client ID** and **Client Secret**

### 3. Get API Keys

#### Ollama Cloud API
1. Visit [Ollama Cloud](https://ollama.cloud) (Note: Replace with actual URL)
2. Create an account and generate API keys
3. You can create multiple keys for rotation

#### Mistral Cloud API
1. Visit [Mistral AI](https://mistral.ai)
2. Sign up and navigate to API keys
3. Generate one or more API keys

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_this_with_openssl_rand_base64_32

# For client-side GitHub login
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Ollama Cloud API Keys (comma-separated for rotation)
OLLAMA_API_KEYS=ollama_key1,ollama_key2,ollama_key3

# Mistral Cloud API Keys (comma-separated for rotation)
MISTRAL_API_KEYS=mistral_key1,mistral_key2

# Environment
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔧 Configuration

### API Key Rotation

VulnScany supports multiple API keys for both Ollama and Mistral:

```env
OLLAMA_API_KEYS=key1,key2,key3
MISTRAL_API_KEYS=keyA,keyB
```

**Benefits:**
- Automatic fallback if a key is rate-limited
- Load distribution across keys
- 1-minute cooldown for failed keys

### Caching Strategy

The app caches non-sensitive vulnerability knowledge:

- **Search Results**: 7 days
- **Vulnerability Info**: 24 hours
- **User Code**: Never cached

---

## 📁 Project Structure

```
vulscany/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── callback/route.ts   # OAuth callback
│   │   │   │   └── logout/route.ts     # Logout endpoint
│   │   │   ├── scan/route.ts           # Repository scanner
│   │   │   └── ai/
│   │   │       └── explain/route.ts    # AI fix generation
│   │   ├── dashboard/page.tsx          # Main dashboard
│   │   ├── privacy/page.tsx            # Privacy policy
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── VulnerabilityCard.tsx       # Vuln display component
│   │  └── RepositoryList.tsx          # Repo list component
│   └── lib/
│       ├── ai/
│       │   ├── ollama.ts               # Ollama Cloud integration
│       │   ├── mistral.ts              # Mistral Cloud integration
│       │   └── rotation.ts             # API key rotation
│       ├── cache/
│       │   └── index.ts                # Caching system
│       ├── github/
│       │   ├── client.ts               # GitHub API client
│       │   └── react-detector.ts       # React project detection
│       └── scanner/
│           └── index.ts                # Vulnerability scanner
├── public/                             # Static assets
├── .env.local                          # Environment variables (not committed)
├── env.example                         # Example environment variables
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── tailwind.config.ts                  # Tailwind config
└── README.md                           # This file
```

---

## 🔍 How It Works

### 1. Authentication Flow

```
User clicks "Connect with GitHub"
  ↓
Redirect to GitHub OAuth
  ↓
User authorizes read:user, repo
  ↓
GitHub redirects to /api/auth/callback
  ↓
Exchange code for access token
  ↓
Store token in httpOnly cookie (2 hours)
  ↓
Redirect to /dashboard
```

### 2. Scanning Process

```
User selects a repository
  ↓
Fetch package.json via GitHub API
  ↓
Check if React project
  ↓
Scan source files for patterns:
  - dangerouslySetInnerHTML
  - SSR injection risks
  - Outdated React versions
  - Unsafe markdown rendering
  - eval() usage
  ↓
Generate report (in memory)
  ↓
Send to browser
  ↓
Discard all data immediately
```

### 3. AI Integration

```
User requests fix suggestion
  ↓
Extract minimal context (file, snippet, issue type)
  ↓
Try Ollama Cloud API
  ↓
If fails → Fallback to Mistral API
  ↓
Generate explanation + fix
  ↓
Display in browser
  ↓
Discard AI prompt from logs
```

---

## 🔐 Privacy & Trust

### What We Do
✅ Scan files in memory only  
✅ Use OAuth short-lived tokens  
✅ Discard data immediately  
✅ Cache only non-sensitive knowledge  

### What We Never Do
❌ Store source code  
❌ Keep GitHub tokens  
❌ Train AI on user data  
❌ Share your information  

See our [Privacy Policy](/privacy) for full details.

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click **New Project**
   - Import your GitHub repository

3. **Add Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables, add all variables from `.env.local`

4. **Update GitHub OAuth:**
   - Go to your GitHub OAuth App settings
   - Update **Homepage URL** to `https://your-app.vercel.app`
   - Update **Callback URL** to `https://your-app.vercel.app/api/auth/callback`

5. **Deploy:**
   Vercel automatically deploys on push to `main`

---

## 🐛 Troubleshooting

### "Unauthorized" error when scanning

**Cause**: GitHub token expired or missing  
**Solution**: Log out and log back in

### "AI service unavailable"

**Cause**: All API keys are rate-limited or invalid  
**Solution**:
1. Check that API keys are valid
2. Wait for rate limit reset (1 minute)
3. Add more API keys for rotation

### "Not a React project"

**Cause**: Repository doesn't have `react` in dependencies  
**Solution**: Ensure the repo has a `package.json` with `react` listed

### GitHub rate limit exceeded

**Cause**: Too many API calls to GitHub  
**Solution**:
1. Wait for rate limit reset (shown in console)
2. Use authenticated requests (already done)
3. For Vercel, use environment variable to increase limits

---

##🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- Built with ❤️ for developers who care about security
- Powered by [Ollama Cloud](https://ollama.cloud) and [Mistral AI](https://mistral.ai)
- Icons from emoji 🎉

---

## 📧 Contact

For questions, feedback, or security concerns:

- **Email**: contact@vulnscany.com
- **Privacy**: privacy@vulnscany.com
- **GitHub**: [Your GitHub Profile]

---

**Built by a security-focused, privacy-first engineering team** 🛡️
