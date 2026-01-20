# Aeglyn: Application Integration Requirements

**Document for: `app.example.com` (vulscany repository)**

To enable the "Persistent Session" feature on the landing page (showing the GitHub username when logged in), the following changes must be implemented in the main application.

---

## 1. Cookie Domain Configuration

The session cookie must be readable across subdomains. By default, browsers restrict cookies to the exact domain (`app.example.com`). We need to set it to the root domain (`.example.com`).

### If using NextAuth.js

Update your `auth.ts` or `[...nextauth].ts` configuration:

```typescript
// auth.ts / [...nextauth].ts
export const authOptions = {
  // ... other config
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: '.example.com' // <--- CRITICAL: Add the leading dot
      }
    }
  }
}
```

### If using custom cookies

Ensure that when you call `res.setHeader('Set-Cookie', ...)` or use a library like `cookies()`, you include the domain:
`domain=.example.com; Path=/; HttpOnly; Secure; SameSite=Lax`

---

## 2. CORS Policy for Session API

The landing page (`https://example.com`) needs to fetch the session status from the app. This requires an explicit CORS policy on the session endpoint.

**Target File:** `src/app/api/auth/session/route.ts` (or equivalent)

```typescript
export async function GET(request: Request) {
  // ... existing session logic ...
  
  const response = NextResponse.json(sessionData);

  // Add these headers
  response.headers.set('Access-Control-Allow-Origin', 'https://example.com');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Handle preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://example.com',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

## 3. Deployment Check

Ensure that the `NEXTAUTH_URL` in your production environment variables is set to `https://app.example.com`.

---

## Summary for the AI Coder
>
> "Please modify the authentication configuration to set the session cookie domain to `.example.com`. Additionally, update the `/api/auth/session` route to allow CORS requests from `https://example.com` with `credentials: include` enabled. This will allow the landing page to detect when a user is logged into the application."
