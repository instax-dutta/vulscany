# Aeglyn Landing Page ↔ Application Integration Guide

**Critical Integration Document for Landing Page Development**

This document explains the complete flow between the Aeglyn landing page and application. This is the **heartbeat** of the entire system - understanding this flow is essential for proper integration.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [The Critical Flow](#the-critical-flow)
3. [Landing Page Requirements](#landing-page-requirements)
4. [Application Behavior](#application-behavior)
5. [URL Structure](#url-structure)
6. [Authentication Flow](#authentication-flow)
7. [User Journey Maps](#user-journey-maps)
8. [Technical Implementation](#technical-implementation)
9. [Testing the Integration](#testing-the-integration)
10. [Common Pitfalls](#common-pitfalls)

---

## System Architecture Overview

### Two Separate Deployments

```
┌─────────────────────────────────────────────────────────────┐
│                    Aeglyn Ecosystem                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   Landing Page       │      │    Application       │    │
│  │   example.com        │◄────►│  app.example.com     │    │
│  │                      │      │                      │    │
│  │  - Marketing         │      │  - Security Scanner  │    │
│  │  - Features          │      │  - Dashboard         │    │
│  │  - Pricing           │      │  - GitHub OAuth      │    │
│  │  - CTA Buttons       │      │  - Scan Results      │    │
│  └──────────────────────┘      └──────────────────────┘    │
│           │                              ▲                   │
│           │                              │                   │
│           └──────────────────────────────┘                   │
│              User clicks "Launch App"                        │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Details

| Aspect | Landing Page | Application |
|--------|--------------|-------------|
| **Domain** | `example.com` | `app.example.com` |
| **Repository** | `vulscany-landing-v1` | `vulscany` |
| **Purpose** | Marketing & User Acquisition | Functionality & Security Scanning |
| **Technology** | Next.js + shadcn/ui | Next.js + AI SDK |
| **Deployment** | Vercel (separate project) | Vercel (separate project) |
| **Managed By** | Different device | This device |

---

## The Critical Flow

### The Heartbeat: User Journey

This is the **most important flow** to understand. Every interaction depends on this:

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE USER FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. NEW USER DISCOVERS AEGLYN
   ├─ User searches "React security scanner"
   ├─ Finds example.com via Google/social media
   └─ Lands on: https://example.com
        │
        ▼
2. USER EXPLORES LANDING PAGE
   ├─ Reads about features
   ├─ Checks pricing
   ├─ Watches demo (if available)
   └─ Decides to try Aeglyn
        │
        ▼
3. USER CLICKS "LAUNCH APP" OR "GET STARTED"
   ├─ Button links to: https://app.example.com
   └─ Browser navigates to app domain
        │
        ▼
4. APP CHECKS AUTHENTICATION
   ├─ App detects: No session cookie
   ├─ User is NOT authenticated
   └─ App redirects BACK to: https://example.com
        │
        │  ┌─────────────────────────────────────┐
        │  │  WHY REDIRECT BACK?                 │
        │  │  - Landing page has "Connect GitHub"│
        │  │  - Better UX for first-time users   │
        │  │  - Clear call-to-action             │
        │  └─────────────────────────────────────┘
        │
        ▼
5. USER SEES LANDING PAGE AGAIN
   ├─ Now clicks "Connect with GitHub" button
   └─ Button triggers GitHub OAuth flow
        │
        ▼
6. GITHUB OAUTH FLOW
   ├─ User clicks "Connect with GitHub"
   ├─ Redirected to: github.com/login/oauth/authorize
   ├─ User authorizes Aeglyn
   └─ GitHub redirects to: app.example.com/api/auth/callback
        │
        ▼
7. APP RECEIVES OAUTH CALLBACK
   ├─ App exchanges code for access token
   ├─ Creates session cookie
   ├─ Stores user data
   └─ Redirects to: /dashboard
        │
        ▼
8. USER LANDS ON DASHBOARD
   ├─ Now authenticated
   ├─ Can scan repositories
   └─ Full app functionality available

┌─────────────────────────────────────────────────────────────────┐
│  RETURNING USER (Already Authenticated)                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Visits app.example.com                                      │
│  2. App detects session cookie                                  │
│  3. Immediately redirects to /dashboard                         │
│  4. User starts working (no landing page shown)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Landing Page Requirements

### Critical: What the Landing Page MUST Have

#### 1. Primary CTA Button: "Launch App"

**Purpose**: Direct users to the application

**Implementation**:
```html
<a 
  href="https://app.example.com"
  class="primary-cta-button"
>
  Launch App
</a>
```

**Styling Requirements**:
- Prominent placement (hero section)
- Aeglyn cyan color (#00d4ff)
- Clear, action-oriented text
- Hover effects for interactivity

**Example (React/Next.js)**:
```tsx
<Link 
  href="https://app.example.com"
  className="inline-flex items-center px-8 py-4 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform"
>
  Launch App →
</Link>
```

#### 2. Authentication CTA: "Connect with GitHub"

**Purpose**: Start the OAuth flow for new users

**Implementation**:
```tsx
'use client';

export function GitHubAuthButton() {
  const handleGitHubAuth = () => {
    const clientId = 'GITHUB_CLIENT_ID_PLACEHOLDER'; // Your GitHub OAuth Client ID
    const redirectUri = encodeURIComponent('https://app.example.com/api/auth/callback');
    const scope = 'read:user repo';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <button
      onClick={handleGitHubAuth}
      className="github-auth-button"
    >
      <GitHubIcon />
      Connect with GitHub
    </button>
  );
}
```

**Critical Details**:
- **Client ID**: `GITHUB_CLIENT_ID_PLACEHOLDER`
- **Redirect URI**: `https://app.example.com/api/auth/callback`
- **Scopes**: `read:user repo`
- Must be a client-side button (use `'use client'` in Next.js)

#### 3. Navigation Links to App

**Where to Link**:
```tsx
// In header/navigation
<nav>
  <Link href="https://example.com">Home</Link>
  <Link href="https://example.com/#features">Features</Link>
  <Link href="https://example.com/#pricing">Pricing</Link>
  <Link href="https://app.example.com">Dashboard</Link> {/* Links to app */}
</nav>
```

#### 4. Footer Links

```tsx
<footer>
  <div className="footer-links">
    <Link href="https://example.com/privacy">Privacy Policy</Link>
    <Link href="https://example.com/terms">Terms of Service</Link>
    <Link href="https://app.example.com">Launch App</Link>
  </div>
</footer>
```

---

## Application Behavior

### How the App Handles Incoming Traffic

#### Root Route Behavior (`app.example.com/`)

**File**: `src/app/page.tsx`

**Logic**:
```typescript
1. User visits app.example.com
2. App checks: Is user authenticated?
   
   IF authenticated (has session cookie):
     → Redirect to /dashboard
   
   IF NOT authenticated (no session):
     → Redirect to https://example.com
```

**Implementation**:
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user) {
          // Authenticated → Dashboard
          router.push('/dashboard');
        } else {
          // Not authenticated → Landing page
          window.location.href = 'https://example.com';
        }
      } catch (error) {
        // Error → Landing page
        window.location.href = 'https://example.com';
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Redirecting...</p>
    </div>
  );
}
```

#### Session Check API (`/api/auth/session`)

**File**: `src/app/api/auth/session/route.ts`

**Purpose**: Check if user is authenticated

**Response**:
```json
// Authenticated
{
  "user": {
    "login": "username",
    "name": "User Name",
    "avatar_url": "https://..."
  }
}

// Not authenticated
{
  "user": null
}
```

---

## URL Structure

### Complete URL Map

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                              │
│                   (example.com)                              │
├─────────────────────────────────────────────────────────────┤
│  /                    → Homepage                             │
│  /#features           → Features section                     │
│  /#pricing            → Pricing section                      │
│  /#how-it-works       → How it works section                 │
│  /privacy             → Privacy policy                       │
│  /terms               → Terms of service                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION                               │
│                 (app.example.com)                            │
├─────────────────────────────────────────────────────────────┤
│  /                           → Smart redirect                │
│    ├─ If authenticated       → /dashboard                    │
│    └─ If not authenticated   → https://example.com           │
│                                                               │
│  /dashboard                  → Main dashboard                │
│  /dashboard/scan             → Repository scanner            │
│  /dashboard/history          → Scan history                  │
│                                                               │
│  /api/auth/callback          → GitHub OAuth callback         │
│  /api/auth/session           → Session check                 │
│  /api/auth/logout            → Logout                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Complete OAuth Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                  GITHUB OAUTH FLOW (DETAILED)                     │
└──────────────────────────────────────────────────────────────────┘

Step 1: User Clicks "Connect with GitHub" on Landing Page
├─ Location: example.com
├─ Button triggers JavaScript function
└─ Constructs OAuth URL with:
    ├─ client_id: GITHUB_CLIENT_ID_PLACEHOLDER
    ├─ redirect_uri: https://app.example.com/api/auth/callback
    └─ scope: read:user repo

Step 2: Redirect to GitHub
├─ Browser navigates to: github.com/login/oauth/authorize
├─ User sees GitHub authorization page
├─ Shows: "Aeglyn wants to access your repositories"
└─ User clicks "Authorize"

Step 3: GitHub Redirects Back
├─ GitHub redirects to: app.example.com/api/auth/callback?code=ABC123
├─ URL contains authorization code
└─ App receives the callback

Step 4: App Exchanges Code for Token
├─ App makes POST request to GitHub
├─ Sends: client_id, client_secret, code
├─ Receives: access_token
└─ Access token allows API calls to GitHub

Step 5: App Fetches User Data
├─ App calls: api.github.com/user (with access_token)
├─ Gets user profile: login, name, avatar_url, etc.
└─ Stores in session

Step 6: App Creates Session
├─ Creates secure httpOnly cookie
├─ Cookie name: "session"
├─ Cookie contains: user data + access_token
├─ Cookie domain: app.example.com
└─ Cookie expires: 2 hours

Step 7: App Redirects to Dashboard
├─ User is now authenticated
├─ Redirects to: /dashboard
└─ User can start using the app

┌──────────────────────────────────────────────────────────────────┐
│  SECURITY NOTES                                                   │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Session cookie is httpOnly (JavaScript cannot access)         │
│  ✓ Session cookie is Secure (HTTPS only)                         │
│  ✓ Session cookie is SameSite=Lax (CSRF protection)              │
│  ✓ Access token is never exposed to client-side JavaScript       │
│  ✓ Client secret is only on server (never in browser)            │
└──────────────────────────────────────────────────────────────────┘
```

---

## User Journey Maps

### Journey 1: First-Time User (Complete Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│  FIRST-TIME USER: From Discovery to Dashboard                   │
└─────────────────────────────────────────────────────────────────┘

Time: 0:00
├─ User searches "React security scanner"
└─ Clicks result: example.com

Time: 0:05
├─ Lands on landing page homepage
├─ Sees hero section: "Code Smarter. Stay Safer."
├─ Scrolls through features
└─ Reads about privacy-first approach

Time: 0:30
├─ Decides to try Aeglyn
├─ Clicks "Join Waitlist" (optional)
└─ Clicks "Launch App" button

Time: 0:31
├─ Browser navigates to: app.example.com
├─ App shows loading spinner
└─ App checks authentication: NONE

Time: 0:32
├─ App redirects back to: example.com
└─ User sees landing page again

Time: 0:33
├─ User notices "Connect with GitHub" button
├─ Clicks button
└─ Redirected to GitHub

Time: 0:35
├─ GitHub shows authorization page
├─ User reviews permissions
└─ Clicks "Authorize Aeglyn"

Time: 0:37
├─ GitHub redirects to: app.example.com/api/auth/callback
├─ App processes OAuth
└─ Creates session

Time: 0:38
├─ App redirects to: /dashboard
├─ User sees dashboard for first time
└─ Onboarding tour starts (optional)

Time: 0:40
├─ User connects first repository
├─ Runs first scan
└─ Sees results

TOTAL TIME: ~40 seconds from landing to scanning
```

### Journey 2: Returning User (Fast Path)

```
┌─────────────────────────────────────────────────────────────────┐
│  RETURNING USER: Quick Access                                    │
└─────────────────────────────────────────────────────────────────┘

Time: 0:00
├─ User types: app.example.com
└─ Browser navigates to app

Time: 0:01
├─ App checks authentication: FOUND
├─ Session cookie is valid
└─ Immediately redirects to /dashboard

Time: 0:02
├─ User sees dashboard
├─ Recent scans visible
└─ Can start working immediately

TOTAL TIME: ~2 seconds from URL to dashboard
```

### Journey 3: User from Landing Page Link

```
┌─────────────────────────────────────────────────────────────────┐
│  USER CLICKS "DASHBOARD" LINK IN LANDING PAGE NAV               │
└─────────────────────────────────────────────────────────────────┘

Scenario A: User is already authenticated
├─ Clicks "Dashboard" link
├─ Browser goes to: app.example.com
├─ App detects session
└─ Redirects to /dashboard (seamless)

Scenario B: User is NOT authenticated
├─ Clicks "Dashboard" link
├─ Browser goes to: app.example.com
├─ App detects no session
├─ Redirects back to: example.com
└─ User sees "Connect with GitHub" button
```

---

## Technical Implementation

### Landing Page: Required Code

#### 1. GitHub OAuth Button Component

```tsx
// components/GitHubAuthButton.tsx
'use client';

import { useState } from 'react';

export function GitHubAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = () => {
    setIsLoading(true);
    
    const params = new URLSearchParams({
      client_id: 'GITHUB_CLIENT_ID_PLACEHOLDER',
      redirect_uri: 'https://app.example.com/api/auth/callback',
      scope: 'read:user repo',
      state: Math.random().toString(36).substring(7), // CSRF protection
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Spinner />
          Connecting...
        </>
      ) : (
        <>
          <GitHubIcon />
          Connect with GitHub
        </>
      )}
    </button>
  );
}
```

#### 2. Launch App Button Component

```tsx
// components/LaunchAppButton.tsx
import Link from 'next/link';

export function LaunchAppButton() {
  return (
    <Link
      href="https://app.example.com"
      className="inline-flex items-center px-8 py-4 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform"
    >
      Launch App →
    </Link>
  );
}
```

#### 3. Hero Section Example

```tsx
// components/Hero.tsx
import { GitHubAuthButton } from './GitHubAuthButton';
import { LaunchAppButton } from './LaunchAppButton';

export function Hero() {
  return (
    <section className="hero">
      <h1>Code Smarter. Stay Safer.</h1>
      <p>
        A privacy-first vibe coding security scanner built for 2026.
      </p>
      
      {/* Primary CTA */}
      <div className="cta-buttons">
        <GitHubAuthButton />
        <LaunchAppButton />
      </div>
      
      {/* Secondary text */}
      <p className="text-sm text-muted">
        Already have access? <a href="https://app.example.com">Launch App</a>
      </p>
    </section>
  );
}
```

#### 4. Navigation with App Link

```tsx
// components/Navbar.tsx
export function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">Aeglyn</Link>
      </div>
      
      <div className="nav-links">
        <Link href="/#features">Features</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link href="/#how-it-works">How It Works</Link>
        
        {/* Link to app */}
        <Link 
          href="https://app.example.com"
          className="app-link"
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
```

---

## Testing the Integration

### Complete Testing Checklist

#### Test 1: New User Flow
```
□ Clear all cookies
□ Visit example.com
□ Click "Launch App"
□ Should redirect back to example.com
□ Click "Connect with GitHub"
□ Authorize on GitHub
□ Should land on app.example.com/dashboard
□ Verify dashboard loads correctly
```

#### Test 2: Returning User Flow
```
□ Already authenticated (from Test 1)
□ Visit app.example.com
□ Should immediately redirect to /dashboard
□ No landing page shown
□ Dashboard loads instantly
```

#### Test 3: Direct Dashboard Link
```
□ Clear cookies
□ Click "Dashboard" link in landing page nav
□ Should go to app.example.com
□ Should redirect back to example.com
□ Click "Connect with GitHub"
□ Should authenticate and land on dashboard
```

#### Test 4: OAuth Flow
```
□ Clear cookies
□ Click "Connect with GitHub"
□ Verify GitHub shows correct app name: "Aeglyn"
□ Verify permissions requested: read:user, repo
□ Authorize
□ Verify callback URL: app.example.com/api/auth/callback
□ Verify redirect to dashboard
□ Verify user data appears in dashboard
```

#### Test 5: Cross-Domain Navigation
```
□ Authenticated user on dashboard
□ Click link to example.com (if any)
□ Navigate around landing page
□ Click "Launch App" again
□ Should go directly to dashboard (no re-auth)
```

---

## Common Pitfalls

### Pitfall 1: Wrong Redirect URI

**Problem**:
```
Error: redirect_uri_mismatch
```

**Cause**:
Landing page uses wrong callback URL

**Fix**:
```tsx
// ❌ WRONG
redirect_uri: 'https://example.com/callback'

// ✅ CORRECT
redirect_uri: 'https://app.example.com/api/auth/callback'
```

### Pitfall 2: Missing Client ID

**Problem**:
OAuth button doesn't work, no redirect to GitHub

**Cause**:
Client ID not set or incorrect

**Fix**:
```tsx
// ✅ CORRECT - Use the actual client ID
client_id: 'GITHUB_CLIENT_ID_PLACEHOLDER'
```

### Pitfall 3: Wrong Scopes

**Problem**:
App can't access user's repositories

**Cause**:
Missing or incorrect OAuth scopes

**Fix**:
```tsx
// ✅ CORRECT - Include both scopes
scope: 'read:user repo'
```

### Pitfall 4: HTTP Instead of HTTPS

**Problem**:
OAuth fails in production

**Cause**:
Using `http://` instead of `https://`

**Fix**:
```tsx
// ❌ WRONG
redirect_uri: 'http://app.example.com/api/auth/callback'

// ✅ CORRECT
redirect_uri: 'https://app.example.com/api/auth/callback'
```

### Pitfall 5: Hardcoded Localhost

**Problem**:
Links don't work in production

**Cause**:
Hardcoded localhost URLs

**Fix**:
```tsx
// ❌ WRONG
<Link href="http://localhost:3000/dashboard">

// ✅ CORRECT
<Link href="https://app.example.com/dashboard">
```

---

## Environment-Specific Configuration

### Development vs Production

```tsx
// config/site.ts
export const SITE_CONFIG = {
  landing: process.env.NODE_ENV === 'production'
    ? 'https://example.com'
    : 'http://localhost:3000',
  
  app: process.env.NODE_ENV === 'production'
    ? 'https://app.example.com'
    : 'http://localhost:3000',
  
  github: {
    clientId: process.env.NODE_ENV === 'production'
      ? 'GITHUB_CLIENT_ID_PLACEHOLDER'  // Production
      : 'your_dev_client_id',    // Development
  }
};

// Usage in components
import { SITE_CONFIG } from '@/config/site';

<Link href={SITE_CONFIG.app}>Launch App</Link>
```

---

## Quick Reference

### Critical URLs

```
Landing Page:     https://example.com
Application:      https://app.example.com
OAuth Callback:   https://app.example.com/api/auth/callback
Dashboard:        https://app.example.com/dashboard
```

### GitHub OAuth Credentials

```
Client ID:        GITHUB_CLIENT_ID_PLACEHOLDER
Client Secret:    (stored securely in Vercel)
Scopes:           read:user repo
Callback URL:     https://app.example.com/api/auth/callback
```

### Key Components Needed in Landing Page

```
✓ GitHubAuthButton component
✓ LaunchAppButton component
✓ Navigation with app link
✓ Footer with app link
✓ Proper href attributes (https://app.example.com)
```

---

## Summary

### The Heartbeat Flow (Remember This!)

```
1. User discovers → example.com
2. User explores → Landing page
3. User clicks → "Launch App" or "Connect GitHub"
4. App checks → Authentication status
5. If not authenticated → Redirect to landing page
6. User authenticates → GitHub OAuth
7. App receives → OAuth callback
8. App creates → Session
9. User lands → Dashboard
10. User works → Scan repositories
```

### Critical Success Factors

✅ **Correct OAuth Configuration**
- Client ID: `GITHUB_CLIENT_ID_PLACEHOLDER`
- Callback: `https://app.example.com/api/auth/callback`
- Scopes: `read:user repo`

✅ **Proper URL Structure**
- Landing: `https://example.com`
- App: `https://app.example.com`
- Always use HTTPS in production

✅ **Clear User Flow**
- Landing page → App → Auth → Dashboard
- No dead ends
- Seamless transitions

✅ **Testing**
- Test new user flow
- Test returning user flow
- Test OAuth flow
- Test cross-domain navigation

---

**This document is the complete blueprint for landing page integration. Follow it precisely for a seamless user experience!** 🚀
