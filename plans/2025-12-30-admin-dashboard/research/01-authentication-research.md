# Authentication Research for Static Sites on GitHub Pages

**Date:** 2025-12-30
**Target:** Lightweight admin dashboard for Astro SSG deployed on GitHub Pages
**Scope:** Client-side authentication with no backend server

---

## Executive Summary

Static site deployment on GitHub Pages eliminates server-side session management. Authentication must operate entirely client-side using modern web standards. **Recommended approach: OAuth + Service Worker pattern with Supabase Auth or Auth0 Universal Login**, offering best balance of security, UX, and simplicity. For ultra-lightweight scenarios, JWT with localStorage + refresh token rotation acceptable but requires careful XSS mitigation.

---

## 1. Client-Side Authentication Approaches

### 1.1 JWT (JSON Web Tokens) with localStorage/sessionStorage

**How it works:**
- User submits credentials to auth provider API
- Provider returns signed JWT (access token + refresh token)
- Client stores tokens in localStorage/sessionStorage
- Tokens sent in Authorization headers for API requests
- Automatic refresh on token expiration

**Advantages:**
- Stateless, no server sessions needed
- Works perfectly with GitHub Pages
- Small bundle size (~8KB with jwt-decode)
- Full control over token lifecycle

**Disadvantages:**
- **XSS vulnerability:** localStorage accessible to inline scripts
- **CSRF risk:** If third-party APIs don't enforce CORS
- Token refresh complexity
- No automatic cleanup on tab/browser close (localStorage)
- Difficult to revoke tokens before expiration

**Security concerns:**
- localStorage is vulnerable to XSS attacks (JavaScript injection)
- sessionStorage is safer (cleared on tab close) but still XSS-vulnerable
- CSRF tokens needed for state-changing operations
- Token rotation strategies essential to limit exposure window

**Astro integration example:**
```astro
---
// Middleware to protect routes
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const token = context.cookies.get('auth_token');
  if (!token && context.request.url.pathname.startsWith('/admin')) {
    return context.redirect('/login');
  }
  return next();
});
---
```

**Best for:** Lightweight dashboards with non-critical data, proof-of-concepts

**Token security improvement:**
- Use **HttpOnly cookies** (server sets them, client JS can't access)
- Requires Astro running with server mode (not pure SSG)
- Not viable for GitHub Pages deployment

---

### 1.2 OAuth Providers (GitHub, Google) for Static Sites

**How it works:**
- Redirect user to provider's login page
- Provider redirects back with authorization code
- Exchange code for tokens using provider's API
- Token handling via service worker or secure storage

**Supported Providers:**
- **GitHub OAuth:** Free, good for developer-focused tools
- **Google OAuth:** Ubiquitous, larger user base
- **Microsoft Entra:** Enterprise use cases

**Astro + GitHub OAuth example:**
```javascript
// src/middleware/auth.ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const code = context.url.searchParams.get('code');

  if (code) {
    // Exchange code for token (requires Netlify/Vercel function)
    // Can't do this directly from client due to secret key exposure
    context.locals.oauth_code = code;
  }

  return next();
});
```

**GitHub Pages limitation:** Cannot directly exchange OAuth code for tokens (requires server secret). Workaround needed.

**Workarounds:**
1. **Third-party service:** Use Auth0, Firebase, or Supabase as intermediary
2. **GitHub App + Netlify Functions:** Hybrid approach
3. **Custom backend:** Deploy simple serverless function separately

**Advantages:**
- No password management
- Provider handles security
- User familiarity
- Easier compliance (GDPR)

**Disadvantages:**
- Requires intermediary service for code exchange
- Dependency on third-party service uptime
- Additional latency
- User must have provider account

**Best for:** Open-source projects, community dashboards

---

### 1.3 Magic Link Authentication

**How it works:**
- User enters email address
- Service sends link with one-time token to email
- User clicks link, token validated, session established
- No passwords required

**Implementation with Supabase example:**
```javascript
// src/utils/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function verifyMagicLink(token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  });
  if (error) throw error;
  return data;
}
```

**Advantages:**
- No passwords = no password leaks
- Better UX (no password reset flows)
- Works with GitHub Pages completely
- Email verification built-in
- Lower bounce rate than OAuth

**Disadvantages:**
- Email delivery dependency
- Slower UX (click + wait)
- Requires email service
- Limited to email-based accounts

**Security analysis:**
- One-time tokens expire quickly (typically 15 mins)
- Email is verified during flow
- No token stored in client until verified
- Rate limiting essential (prevent email bombing)

**Best for:** Admin dashboards with known users, internal tools

---

### 1.4 Auth0 Universal Login

**How it works:**
- Redirect to Auth0's hosted login page
- Auth0 handles credentials/OAuth/MFA
- Redirect back with authorization code
- Auth0 SDK handles token exchange and refresh

**Astro integration:**
```javascript
// src/pages/auth/callback.astro
---
import { Auth0Client } from '@auth0/auth0-spa-js';

const auth0 = new Auth0Client({
  domain: import.meta.env.PUBLIC_AUTH0_DOMAIN,
  clientId: import.meta.env.PUBLIC_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: `${import.meta.env.SITE}/auth/callback`,
  },
});

const result = await auth0.handleRedirectCallback();
const token = await auth0.getTokenSilently();

// Store in localStorage
localStorage.setItem('auth0_token', token);
---
```

**Advantages:**
- Hosted login page (no password exposure)
- Multiple auth methods (email, OAuth, MFA)
- Enterprise SSO support
- Professional-grade security
- Works with GitHub Pages

**Disadvantages:**
- Cost: $0-600+/month depending on usage
- Vendor lock-in
- Bundle size impact (~40KB)
- Requires Auth0 account

**Pricing tiers:**
- Free: Up to 7,000 active users
- Pro: ~$23/month
- Enterprise: Custom pricing

**Best for:** Production dashboards, B2B applications

---

### 1.5 Firebase Authentication

**How it works:**
- Firebase SDK initializes on client
- Supports email, Google OAuth, GitHub, Facebook, etc.
- Token stored in browser persistence
- Automatic token refresh

**Astro integration:**
```javascript
// src/utils/firebase-auth.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function getIdToken() {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
}
```

**Advantages:**
- Free tier generous (100k auth/month)
- Multiple auth methods built-in
- Real-time database integration
- Excellent documentation
- No server needed

**Disadvantages:**
- API key exposed in client code (security risk)
- Firebase project public after initialization
- Harder to implement custom auth flows
- Bundle size: ~80KB

**Security considerations:**
- API keys are public by design, use security rules
- Cannot safely revoke tokens on client
- Requires Firebase security rules configuration

**Firebase Security Rules example:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admin/{document=**} {
      allow read, write: if request.auth.uid == request.resource.data.owner_id;
    }
  }
}
```

**Best for:** Rapid prototyping, projects already using Firebase

---

### 1.6 Supabase Authentication

**How it works:**
- Supabase Auth (built on GoTrue)
- Supports email, OAuth, magic links, MFA
- Token stored in localStorage with automatic refresh
- Session management via refresh tokens

**Astro integration (recommended):**
```javascript
// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export async function loginWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function loginWithOAuth(provider: 'github' | 'google') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${import.meta.env.SITE}/auth/callback` },
  });
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user;
}
```

**Route protection in Astro:**
```astro
---
// src/middleware/auth.ts
import { defineMiddleware } from "astro:middleware";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.url.pathname.startsWith('/admin')) {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      return context.redirect('/login');
    }
  }

  return next();
});
---
```

**Advantages:**
- Free tier: 50,000 MAU
- Postgres database included
- Real-time subscriptions
- Row-level security
- Magic links built-in
- OAuth providers pre-configured
- No server required
- Works perfectly with GitHub Pages

**Disadvantages:**
- Vendor lock-in (Supabase)
- Paid after free tier
- Requires public anon key exposure
- ~60KB bundle size

**Pricing:**
- Free: 50,000 MAU, decent limits
- Pro: $25/month per project
- Custom: Enterprise pricing

**Security model:**
- Anon key is public (by design)
- Session tokens are JWT, stored in localStorage
- Refresh tokens used for automatic renewal
- Row-level security (RLS) enforces data access
- CORS configuration prevents unauthorized requests

**Best for:** Admin dashboards with data storage, recommended approach

---

## 2. Static Site Constraints Analysis

### 2.1 GitHub Pages Limitations

**Hard constraints:**
- No server-side processing
- No environment variables (must be public)
- No file uploads (except via external service)
- Static HTML, CSS, JS only
- No backend-specific frameworks (Rails, Django, etc.)

**Workarounds for auth:**
- Client-side token handling (all approaches discussed work)
- External BaaS for token exchange (Firebase, Supabase, Auth0)
- Service Worker for secure token handling

### 2.2 Astro SSG Compatibility

**Static generation (default):**
- Routes generated at build time
- Protected routes cannot use traditional middleware
- Must use client-side route guards

**Protected route implementation:**
```astro
---
// src/pages/admin/index.astro
const token = Astro.cookies.get('auth_token')?.value;

// Redirect at build time not possible
// Must handle client-side
---

<script>
  // Check token on page load
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = '/login';
  }
</script>
```

**Better approach - hybrid rendering:**
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'hybrid',
  adapter: netlify(), // or vercel()
});
```

With hybrid mode, use server-side middleware:
```javascript
// src/middleware/auth.ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  if (context.request.url.pathname.startsWith('/admin')) {
    const token = context.cookies.get('auth_token');
    if (!token) {
      return context.redirect('/login');
    }
  }
  return next();
});
```

**Note:** GitHub Pages uses pure static deployment, so hybrid mode requires Netlify/Vercel adapter

### 2.3 Bundle Size Impact

**Authentication libraries (production bundles):**
- JWT decode: ~8 KB
- Auth0 SDK: ~40 KB
- Firebase SDK: ~80 KB
- Supabase JS client: ~60 KB
- OAuth provider SDKs: ~20-30 KB each

**Optimization strategies:**
- Code splitting for auth components
- Lazy load auth library on protected routes
- Tree-shake unused OAuth providers
- Defer token refresh operations

**Bundle optimization example:**
```javascript
// src/components/LoginForm.astro
<div id="login-form"></div>

<script>
  // Load auth library only when needed
  const init = async () => {
    const { supabase } = await import('../utils/supabase');
    // Initialize after page loaded
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
</script>
```

---

## 3. Security Considerations

### 3.1 XSS Protection for Token Storage

**Vulnerability:** JavaScript can access localStorage, enabling token theft via XSS

**Mitigation strategies:**

**1. Content Security Policy (CSP)**
```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
```

Strict CSP prevents inline script injection:
- Disallow `'unsafe-inline'` JavaScript
- Only load scripts from `'self'`
- Restrict external script sources

**2. Service Worker for token handling**
```javascript
// src/service-worker.ts
self.addEventListener('message', (event) => {
  if (event.data.type === 'GET_TOKEN') {
    const token = localStorage.getItem('auth_token');
    event.ports[0].postMessage({ token });
  }
});
```

Token never directly accessible to window context:
- Service Worker owns token
- Page requests token via MessageChannel
- XSS attack can't directly steal token

**3. sessionStorage over localStorage**
```javascript
// Clears automatically on tab close
sessionStorage.setItem('auth_token', token);

// vs. localStorage - persists forever
localStorage.setItem('auth_token', token); // Not recommended
```

**4. Encrypted storage**
```javascript
import { encrypt, decrypt } from 'crypto-js';

const encryptedToken = encrypt(token, SECRET_KEY);
localStorage.setItem('auth_token', encryptedToken);

// On retrieval
const token = decrypt(localStorage.getItem('auth_token'), SECRET_KEY);
```

**Limitation:** SECRET_KEY still exposed in client code

**5. Memory-only storage (most secure)**
```javascript
// Don't persist to disk
let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

// Token lost on page refresh (bad UX)
```

**Recommended approach for GitHub Pages:**
- Use sessionStorage (auto-clears)
- Implement refresh token rotation
- Set strong CSP headers via GitHub Pages configuration
- Consider Service Worker for sensitive tokens

### 3.2 CSRF Prevention

**Risk:** Attacker site makes requests to admin dashboard on user's behalf

**Solutions:**

**1. SameSite Cookie attribute**
```javascript
// Server sets during login
Set-Cookie: auth_token=...; SameSite=Strict; Secure; HttpOnly
```

Not applicable to GitHub Pages (no server control)

**2. CSRF tokens for state-changing operations**
```javascript
// Generate token on page load
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

// Include in POST requests
fetch('/api/update', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* data */ })
});
```

Backend must validate token matches session

**3. Origin validation**
```javascript
// Client-side validation
const origin = new URL(request.referrer).origin;
const allowedOrigins = ['https://yourdomain.com'];

if (!allowedOrigins.includes(origin)) {
  throw new Error('CSRF detected');
}
```

**4. State parameter in OAuth**
```javascript
const state = Math.random().toString(36);
sessionStorage.setItem('oauth_state', state);

// OAuth provider redirects with state
// Verify state matches before token exchange
```

**Recommended for GitHub Pages:**
- Origin validation on API requests
- State parameter for OAuth flows
- Require HTTPS only (GitHub Pages default)

### 3.3 Token Refresh Strategies

**Challenge:** Access tokens expire; need silent refresh without user interaction

**Silent refresh approach:**
```javascript
// src/utils/token-manager.ts
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes

export async function getValidToken() {
  const tokenData = JSON.parse(localStorage.getItem('auth_token_data') || '{}');
  const { access_token, refresh_token, expires_at } = tokenData;

  const now = Date.now();
  const timeUntilExpiry = expires_at - now;

  // Refresh if within buffer
  if (timeUntilExpiry < TOKEN_EXPIRY_BUFFER) {
    return await refreshToken(refresh_token);
  }

  return access_token;
}

export async function refreshToken(refreshToken) {
  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: import.meta.env.PUBLIC_CLIENT_ID,
    }),
  });

  const data = await response.json();

  localStorage.setItem('auth_token_data', JSON.stringify({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  }));

  return data.access_token;
}
```

**API request interceptor:**
```javascript
// Intercept all API calls
export async function apiCall(endpoint, options) {
  const token = await getValidToken();

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Token invalid, logout
    handleLogout();
  }

  return response;
}
```

**Refresh token rotation:**
```javascript
// On every refresh, issue new refresh token
// Invalidate old tokens (prevent token reuse attacks)

// Server-side logic (if using backend):
const { new_access_token, new_refresh_token } = await refreshAccessToken(oldRefreshToken);
// Invalidate oldRefreshToken in database
```

**Automatic refresh on window focus:**
```javascript
window.addEventListener('focus', async () => {
  // Refresh token when user returns to tab
  // Useful if app was idle in background
  const token = await getValidToken();
  console.log('Token refreshed on focus');
});
```

### 3.4 Protected Route Implementation in Astro

**Challenge:** Astro SSG generates static HTML; can't enforce auth at build time

**Solution 1: Client-side route guard**
```astro
---
// src/pages/admin/index.astro
---
<Layout title="Admin Dashboard">
  <div id="admin-container">
    <!-- Content here -->
  </div>
</Layout>

<script>
  import { getCurrentUser } from '../utils/auth';

  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/login';
  } else {
    console.log('User authenticated:', user);
  }
</script>
```

**Solution 2: Protected component wrapper**
```astro
---
// src/components/ProtectedRoute.astro
import { getCurrentUser } from '../utils/auth';

const user = await getCurrentUser();

// This runs on server/build time, won't work for pure SSG
// Only works with Astro hybrid mode or full SSR
---

{user ? <slot /> : <p>Unauthorized</p>}
```

**Solution 3: Hybrid mode with server-side auth**
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'hybrid',
  adapter: netlify(),
});
```

```javascript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  if (context.request.url.pathname.startsWith('/admin')) {
    const token = context.cookies.get('auth_token');

    if (!token) {
      return context.redirect('/login');
    }

    // Verify token validity (basic check)
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.exp * 1000 < Date.now()) {
        context.cookies.delete('auth_token');
        return context.redirect('/login');
      }
    } catch {
      return context.redirect('/login');
    }
  }

  return next();
});
```

**Best practice for GitHub Pages:**
- Use client-side route guards (no server required)
- Load sensitive content conditionally
- Redirect to login if not authenticated
- Show loading state while checking auth

---

## 4. Recommended Approach: OAuth + Service Worker with Supabase

### Why This Approach?

**Criteria:**
1. ✓ Works on GitHub Pages (no server)
2. ✓ Minimal bundle impact (~60 KB)
3. ✓ Strong security model
4. ✓ Good developer experience
5. ✓ Reasonable cost ($0-25/month)
6. ✓ Flexible authentication methods
7. ✓ Built-in data storage

**Supabase advantages:**
- Free tier sufficient for small dashboards (50,000 MAU)
- Magic link + OAuth providers + password auth
- Row-level security for data protection
- Real-time updates if needed
- PostgreSQL database for admin data
- Excellent TypeScript support

### Architecture

```
GitHub Pages (Static)
├── Login Page
│   └── Redirect to Supabase Auth
├── OAuth Callback
│   └── Store session token
├── Protected Routes
│   └── Client-side guards
└── Service Worker
    └── Secure token handling

Supabase Backend
├── Authentication (GoTrue)
├── PostgreSQL Database
├── Row-Level Security
└── Token Validation
```

### Implementation Steps

**1. Initialize Supabase**
```javascript
// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

**2. Login page**
```astro
---
// src/pages/login.astro
import Layout from '../layouts/Layout.astro';
---

<Layout title="Login">
  <form id="login-form">
    <input type="email" placeholder="Email" required />
    <input type="password" placeholder="Password" required />
    <button type="submit">Sign In</button>

    <hr />

    <button type="button" id="github-login">Login with GitHub</button>
    <button type="button" id="google-login">Login with Google</button>
  </form>
</Layout>

<script>
  import { supabase } from '../utils/supabase';

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = form.querySelector('input[type="email"]')?.value;
    const password = form.querySelector('input[type="password"]')?.value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      window.location.href = '/admin';
    }
  });

  document.getElementById('github-login')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) alert(error.message);
  });

  document.getElementById('google-login')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) alert(error.message);
  });
</script>
```

**3. OAuth callback handler**
```astro
---
// src/pages/auth/callback.astro
import { supabase } from '../../utils/supabase';
import Layout from '../../layouts/Layout.astro';

const code = Astro.url.searchParams.get('code');

if (code) {
  // Exchange code for session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return Astro.redirect('/admin');
  }
}
---

<Layout title="Authenticating...">
  <p>Processing your login...</p>
</Layout>

<script>
  // Fallback redirect if something went wrong
  window.location.href = '/login';
</script>
```

**4. Protected admin page**
```astro
---
// src/pages/admin/index.astro
import Layout from '../../layouts/Layout.astro';
import ProtectedLayout from '../../layouts/ProtectedLayout.astro';
---

<ProtectedLayout title="Admin Dashboard">
  <h1>Welcome to Admin Dashboard</h1>
  <div id="user-info"></div>
  <button id="logout">Logout</button>
</ProtectedLayout>

<script>
  import { supabase } from '../../utils/supabase';

  async function initDashboard() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    document.getElementById('user-info')!.textContent = `Logged in as: ${user.email}`;
  }

  document.getElementById('logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  });

  initDashboard();
</script>
```

**5. Protected layout component**
```astro
---
// src/layouts/ProtectedLayout.astro
import { supabase } from '../utils/supabase';
import Layout from './Layout.astro';

// This can't enforce auth at build time in pure SSG
// Must be done client-side
---

<Layout {...Astro.props}>
  <slot />
</Layout>

<script>
  // Verify auth on page load
  import { supabase } from '../utils/supabase';

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
    }
  };

  checkAuth();
</script>
```

### Security Configuration

**1. Enable RLS in Supabase**
```sql
-- src/database/migrations/enable_rls.sql
ALTER TABLE admin_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
  ON admin_data
  FOR ALL
  USING (auth.uid() = user_id);
```

**2. Set CORS headers**
```javascript
// Supabase Project Settings > API
// Configure allowed origins:
// https://yourdomain.github.io
// https://yourdomain.com
// http://localhost:3000 (development)
```

**3. Configure OAuth providers**
```
Supabase Dashboard > Authentication > Providers

GitHub:
- Client ID: [from GitHub App]
- Client Secret: [from GitHub App]

Google:
- Client ID: [from Google Cloud Console]
- Client Secret: [from Google Cloud Console]
```

### Environment Setup

```bash
# .env.local (never commit)
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Netlify/GitHub Secrets (production)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cost Analysis

**Supabase Free Tier:**
- 50,000 monthly active users
- 500 MB database
- 2 GB bandwidth
- Perfect for small admin dashboards

**If exceeding free tier:**
- Pro Plan: $25/month
- Scales to millions of users
- Unlimited database size (up to storage limit)

---

## 5. Alternative: Magic Link + Supabase (Simpler)

For ultra-simple admin dashboards without OAuth complexity:

**Advantages:**
- Simplest UX (no password field)
- No OAuth provider setup
- Works with any email
- Verification built-in

**Implementation:**
```astro
---
// src/pages/login.astro
---

<form id="login-form">
  <input type="email" placeholder="Email" required />
  <button type="submit">Send Magic Link</button>
  <p id="status"></p>
</form>

<script>
  import { supabase } from '../utils/supabase';

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).querySelector('input[type="email"]')?.value;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      document.getElementById('status')!.textContent = `Error: ${error.message}`;
    } else {
      document.getElementById('status')!.textContent = 'Check your email for login link!';
    }
  });
</script>
```

**Cost:** Same as password auth (~$0 on free tier)
**Security:** Higher (no password exposure)
**UX:** Better (fewer fields to fill)

---

## 6. Implementation Comparison Matrix

| Approach | Bundle | Cost | Setup | Security | GitHub Pages | Recommended |
|----------|--------|------|-------|----------|--------------|-------------|
| JWT + localStorage | 8 KB | Free | Easy | ⚠️ Low | ✓ | ❌ |
| OAuth (direct) | 20 KB | Free | Hard | ⚠️ Medium | ❌ | ❌ |
| Firebase | 80 KB | Free/Paid | Medium | ✓ | ✓ | ⚠️ |
| Auth0 | 40 KB | Free/Paid | Medium | ✓ | ✓ | ⚠️ |
| Supabase (OAuth) | 60 KB | Free/Paid | Medium | ✓✓ | ✓ | ✓✓ |
| Supabase (Magic) | 60 KB | Free/Paid | Easy | ✓✓ | ✓ | ✓✓ |

---

## 7. Development Checklist

### Phase 1: Setup
- [ ] Create Supabase project
- [ ] Configure OAuth providers (GitHub/Google)
- [ ] Set environment variables
- [ ] Initialize Supabase client in Astro

### Phase 2: Authentication
- [ ] Build login page (password + OAuth)
- [ ] Implement OAuth callback handler
- [ ] Add logout functionality
- [ ] Token refresh logic

### Phase 3: Protection
- [ ] Client-side route guards
- [ ] Protected layout component
- [ ] Session persistence
- [ ] Session restoration on page load

### Phase 4: Data Access
- [ ] Set up database schema
- [ ] Enable RLS policies
- [ ] Create data access functions
- [ ] Test row-level security

### Phase 5: Security Hardening
- [ ] Configure CSP headers
- [ ] Enable HTTPS (GitHub Pages default)
- [ ] Set CORS restrictions
- [ ] Test XSS protection
- [ ] Implement token rotation

### Phase 6: Deployment
- [ ] Test on GitHub Pages environment
- [ ] Verify OAuth redirects work
- [ ] Monitor token expiration
- [ ] Set up error logging
- [ ] Create user onboarding docs

---

## 8. Unresolved Questions

1. **Multi-tenancy:** If supporting multiple organizations, Supabase RLS row-level security model?
2. **Offline capability:** Is offline access needed? (LocalStorage + Service Worker caching)
3. **Audit logging:** Do admin actions need full audit trail?
4. **User roles/permissions:** Complex RBAC or simple admin/user split?
5. **Session duration:** How long should tokens remain valid before requiring re-login?
6. **Mobile support:** Admin dashboard on mobile devices? (affects token storage)
7. **Single Sign-On (SSO):** Enterprise authentication needs?
8. **Two-factor authentication (2FA):** Required for compliance?

---

## 9. Recommended Next Steps

1. **Choose approach:** Supabase OAuth + Magic Link (recommended)
2. **Setup Supabase:** Create free project, configure OAuth providers
3. **Prototype:** Implement basic login/protected route
4. **Test:** Verify OAuth flow on GitHub Pages
5. **Harden:** Add security measures (CSP, token rotation, etc.)
6. **Document:** User onboarding and auth troubleshooting guide

---

## References & Resources

**Authentication Libraries:**
- Supabase Auth: https://supabase.com/docs/guides/auth
- Firebase Auth: https://firebase.google.com/docs/auth
- Auth0: https://auth0.com/docs
- jsonwebtoken: https://www.npmjs.com/package/jsonwebtoken

**Astro Integration:**
- Astro Docs: https://docs.astro.build
- Astro Middleware: https://docs.astro.build/en/guides/middleware/
- Astro Hybrid Mode: https://docs.astro.build/en/basics/rendering-modes/

**Security:**
- OWASP Auth Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- CORS Security: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- CSP Headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

**GitHub Pages:**
- GitHub Pages Deployment: https://docs.github.com/en/pages
- Custom Domain: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- GitHub Actions: https://docs.github.com/en/actions

---

**Report Generated:** 2025-12-30
**Status:** Ready for implementation
**Recommendation Level:** High confidence (Supabase approach)
