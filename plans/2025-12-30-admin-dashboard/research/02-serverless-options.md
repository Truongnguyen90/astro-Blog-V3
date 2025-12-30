# Serverless/API Options for Static Sites on GitHub Pages
**Date:** 2025-12-30
**Project:** Flaco Admin Dashboard
**Context:** Building dynamic admin dashboard with analytics, media upload, auth on static GitHub Pages deployment

---

## Executive Summary

GitHub Pages is fundamentally limited to static file serving. However, combining it with serverless backends and external services enables full-featured dashboards. **Recommended approach: Hybrid model using Cloudflare Workers + Supabase** for optimal cost, performance, and ease of integration with GitHub Pages.

---

## 1. GitHub Pages Limitations

### Hard Constraints
| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| **Static files only** | No Node.js, Python, PHP execution | Use external API services |
| **No server-side rendering** | All content pre-built at deployment | Pre-render at build time with GitHub Actions |
| **No persistent state** | Cannot store data between requests | External database (Supabase, Firebase, etc.) |
| **No scheduled jobs** | Cannot run background tasks | GitHub Actions for scheduling |
| **CORS browser enforcement** | XHR/Fetch requests blocked from different origins | Serverless proxy endpoints, proxy headers |
| **No authentication state** | Sessions require external provider | JWT via external auth service |

### CORS Specific Issues
```
GitHub Pages Origin: https://username.github.io
API Call Destination: https://api.example.com

Browser blocks unless:
✓ API includes Access-Control-Allow-Origin header
✓ API implements CORS preflight responses
✓ Use JSONP (legacy, not recommended)
✓ Proxy through same-origin endpoint
```

**Solution:** Use serverless functions on same domain via subdomain (Vercel, Netlify) or use serverless proxy layer (Cloudflare Workers).

---

## 2. Serverless Alternatives Comparison

### 2.1 Cloudflare Workers (RECOMMENDED)
**Best for:** Static sites needing lightweight API layer + global edge deployment

#### Pros
- **Edge execution:** Deployed globally, minimal latency
- **Free tier:** 100K requests/day (production-grade)
- **Zero cold starts:** Instant execution
- **Integrated with DNS:** Route `/api/*` to Workers via DNS
- **Simple deployment:** Git-integrated via `wrangler`
- **Request/Response modification:** Can add CORS headers, proxy requests
- **D1 Database:** Lightweight SQLite at edge (paid tier)
- **KV Storage:** Global key-value store for caching
- **Cost efficient:** $5/month for high-volume apps

#### Cons
- Learning curve for edge runtime differences
- Limited to 10ms CPU execution (per request)
- TypeScript/JavaScript only
- Need custom setup for GitHub Pages -> Workers routing

#### Use Cases
- API proxy with CORS headers
- Authentication token validation
- Analytics aggregation
- Media upload gateway
- Rate limiting

#### Cost Estimate
```
Free Tier: 100K requests/day = 3M/month
Paid Tier: $0.15 per million requests
```

---

### 2.2 Vercel Edge Functions
**Best for:** Teams already using Vercel or wanting React/Next.js integration

#### Pros
- **Native Next.js integration:** Deploy alongside frontend
- **Easy migration:** Move from GitHub Pages to Vercel
- **Analytics included:** Built-in performance monitoring
- **Environment variables:** Managed via dashboard
- **Cost:** $20/month (includes Edge Functions)

#### Cons
- **Lock-in:** More committed to Vercel ecosystem
- **Pricing:** More expensive than Cloudflare
- **GitHub Pages limitation:** Requires migration away from GitHub Pages
- **Not true edge:** Runs in regional datacenters (not global edge like Cloudflare)

#### When to Use
- Planning to move away from GitHub Pages
- Already using Vercel for projects
- Need full Next.js framework features

---

### 2.3 Netlify Functions
**Best for:** Jamstack teams, good middle ground

#### Pros
- **Background Functions:** Up to 15 min execution (vs Cloudflare 10s)
- **Scheduled Functions:** Built-in cron jobs
- **Form handling:** Native form submission support
- **GitHub integration:** Automatic deploys from GitHub
- **Free tier:** Generous function calls (125K/month)

#### Cons
- **Cold starts:** ~500-1000ms on free tier
- **Pricing:** $19/month for production (includes Functions)
- **Latency:** No true edge deployment
- **GitHub Pages requirement:** Requires separate Netlify deployment

#### Cost
```
Free: 125K invocations/month
Pro: $19/month - unlimited
```

---

### 2.4 AWS Lambda
**Best for:** Enterprise, complex microservices

#### Pros
- **Unlimited scaling:** Can handle any volume
- **Multiple runtimes:** Node.js, Python, Go, Java, Rust
- **Async operations:** SQS, SNS integration
- **Fine-grained control:** VPC, security groups, IAM

#### Cons
- **Complexity:** Requires AWS knowledge
- **Cold starts:** 1-3s on Node.js
- **Pricing complex:** Can be expensive at scale
- **Overkill for simple dashboards**

#### Not Recommended
Too complex for admin dashboard needs. Cloudflare or Netlify sufficient.

---

## 3. File-Based Approaches (Low-Tech Solutions)

### 3.1 Static JSON Data Files
**Concept:** Pre-build all data as JSON at build time, serve from GitHub Pages

#### Implementation
```
./public/data/
├── analytics.json
├── posts.json
└── users.json
```

GitHub Pages serves as-is. Frontend fetches at runtime.

#### Pros
- **No external dependencies**
- **Fastest possible:** Static file serving
- **Easy caching:** Forever cache with versioning
- **Offline capable:** Full local data

#### Cons
- **Stale data:** Updates require rebuild
- **Not real-time:** Minutes to hours delay
- **Large datasets problematic:** Entire dataset fetched on page load
- **Analytics:** Can't track unique metrics server-side

#### Use Case
Analytics dashboards updated hourly via GitHub Actions cron job.

---

### 3.2 GitHub API for Content Updates
**Concept:** Use GitHub API to modify content stored in repo

#### Implementation
```typescript
// Update analytics.json via GitHub API
const updateAnalytics = async (data) => {
  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path: 'public/data/analytics.json',
    message: 'Update analytics',
    content: Buffer.from(JSON.stringify(data)).toString('base64'),
    sha: await getCurrentSha() // for updates
  });
};
```

#### Pros
- **Version control:** All changes tracked in Git
- **Rollback support:** Revert bad data
- **Audit trail:** See who changed what
- **No database needed:** Git is your DB

#### Cons
- **Rate limited:** GitHub API 60 req/hr (unauthenticated), 5000 (authenticated)
- **Race conditions:** Multiple writers problematic
- **Slow:** API calls + GitHub Actions rebuild workflow
- **Not real-time:** Build time adds 30-60 seconds

#### Realistic Use
- Analytics updated every 6 hours
- Batch operations to stay under rate limits
- Single source of truth (GitHub Actions workflow)

---

### 3.3 GitHub Actions for Scheduled Builds
**Concept:** Scheduled cron job rebuilds static site with latest data

#### Implementation
```yaml
# .github/workflows/update-analytics.yml
name: Update Analytics
on:
  schedule:
    - cron: '0 * * * *'  # hourly
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Fetch analytics
        run: |
          curl https://analytics-api.example.com/export > public/data/analytics.json
      - name: Commit and push
        run: |
          git add public/data/analytics.json
          git commit -m "Update analytics"
          git push
```

#### Pros
- **Automatic updates:** No manual intervention
- **Audit trail:** Git history shows all changes
- **Flexible triggers:** Time-based, webhook-based
- **Cost:** Free (GitHub Actions free tier: 2000 min/month)

#### Cons
- **Latency:** Data delayed by workflow execution time
- **Not real-time:** Best for hourly/daily updates
- **Dependency chain:** External API must be reliable

---

## 4. Hybrid Approaches (Recommended)

### 4.1 GitHub Pages + Cloudflare Workers + External Database
**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│  Visitor (Browser)                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ GitHub Pages (Static HTML/CSS) │
        │ - Serves frontend (built)      │
        │ - Zero backend logic           │
        └────────┬─────────────────────┘
                 │ (admin dashboard requests)
                 ▼
        ┌────────────────────────────────┐
        │ Cloudflare Workers             │
        │ - API gateway/proxy            │
        │ - CORS handling                │
        │ - Rate limiting                │
        │ - Auth validation              │
        └────────┬─────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │ External Services              │
        │ - Supabase (PostgreSQL)        │
        │ - Auth tokens stored here      │
        │ - Analytics data               │
        │ - Media URLs (stored in DB)    │
        └────────────────────────────────┘
```

#### Benefits
- **GitHub Pages:** Serves static site (free, fast)
- **Workers:** API layer with zero cold start
- **Supabase:** Managed PostgreSQL, auth, storage

#### Flow: Media Upload
1. User clicks upload in GitHub Pages frontend
2. POST to `/api/upload` (served by Cloudflare Worker)
3. Worker validates JWT token
4. Worker creates presigned URL for Supabase storage
5. Frontend uploads directly to Supabase (CORS enabled)
6. Webhook from Supabase updates analytics DB
7. Dashboard refreshes with new media

#### Cost (Monthly)
```
GitHub Pages:      $0 (free hosting)
Cloudflare Worker: $5 (generous free tier)
Supabase:          $25/month starter (includes DB, auth, storage)
Total:             $30/month (production-ready)
```

---

### 4.2 GitHub Pages + External Auth + REST API Service
**When to use:** Want simplest possible backend, okay with third-party deps

**Services:**
- **Supabase:** PostgreSQL + Auth + Storage + Realtime
- **Firebase:** Firestore + Auth + Storage
- **PocketBase:** Self-hosted all-in-one
- **Convex:** Sync engine + backend (modern alternative)

**Flow:**
```
Frontend (GitHub Pages)
  ↓
  ├─→ Authentication → Supabase Auth
  │                    (stores JWT)
  │
  ├─→ Analytics Read → Supabase PostgreSQL
  │
  ├─→ Media Upload → Supabase Storage
  │
  └─→ Data Updates → Supabase API
```

#### Pros
- **Complete solution:** No glue code needed
- **Built-in auth:** Social + email login
- **Real-time:** Subscriptions available
- **Simple:** Fewer moving parts

#### Cons
- **Vendor lock-in:** Switching providers is hard
- **Cost at scale:** More expensive than Cloudflare + DIY
- **Feature bloat:** Often includes things you won't use

#### Recommended: Supabase
```javascript
// Frontend code (runs on GitHub Pages)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://project.supabase.co',
  'PUBLIC_KEY'
)

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
})

// Analytics read
const { data: analytics } = await supabase
  .from('analytics')
  .select('*')

// Media upload
const { data, error } = await supabase
  .storage
  .from('media')
  .upload('file.jpg', file)
```

---

## 5. Admin Dashboard Specific Recommendations

### Analytics Dashboard
**Challenge:** Real-time or frequent updates, aggregation needed

**Solution:** GitHub Actions cron + Static JSON
```
Every 1 hour:
  - Fetch analytics from source (Google Analytics, Plausible, etc.)
  - Aggregate to JSON
  - Commit to repo
  - GitHub Pages serves fresh JSON

Cost: $0 (GitHub Pages + GitHub Actions free tier)
Latency: 1 hour
```

**Alternative:** Cloudflare Workers + KV Store
```
Workers aggregates data every minute
Serves from edge cache (KV)
Cost: $5/month
Latency: 1 minute
```

---

### Media Upload
**Challenge:** Large files, direct uploads needed

**Solution:** Supabase Storage
```typescript
// Frontend on GitHub Pages
const file = event.target.files[0]
const { data, error } = await supabase
  .storage
  .from('media')
  .upload(`media/${Date.now()}-${file.name}`, file)

// Get public URL
const { data } = supabase
  .storage
  .from('media')
  .getPublicUrl(`media/${Date.now()}-${file.name}`)
```

**Alternative:** Cloudflare Workers + R2
```
Workers presigns R2 URL → Direct upload
No bandwidth charges for uploads
$5/month base + $0.015/GB storage
```

---

### Authentication
**Challenge:** Secure token management, session handling

**Solution: Supabase Auth**
```typescript
// GitHub Pages dashboard
const { user, session } = await supabase.auth.getSession()

if (!session) {
  // Redirect to login
  window.location.href = '/login'
}

// Token auto-refreshed
const token = session.access_token
```

**Alternative: Cloudflare Workers Middleware**
```typescript
// Worker intercepts requests to /api/*
export default {
  async fetch(request, env) {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token || !isValidJWT(token, env.JWT_SECRET)) {
      return new Response('Unauthorized', { status: 401 })
    }

    return fetchDownstream(request)
  }
}
```

---

## 6. Decision Matrix

| Use Case | GitHub Pages | Workers | Netlify | Vercel | Supabase | Firebase |
|----------|---|---|---|---|---|---|
| **Static hosting** | ⭐⭐⭐⭐⭐ | N/A | - | ⭐⭐ | N/A | - |
| **Real-time API** | ❌ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Auth management** | ❌ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Media storage** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Analytics** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Scheduled jobs** | ⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | - | ⭐ |
| **Cost efficiency** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Vendor lock-in** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐ |

---

## 7. RECOMMENDED APPROACH

### Architecture: GitHub Pages + Cloudflare Workers + Supabase

**Why this combination?**
- **Lowest cost:** $30/month for production
- **Fastest performance:** Cloudflare edge + zero cold start
- **Minimal vendor lock-in:** Can swap Workers for Lambda later
- **Proven pattern:** Hundreds of projects use this
- **Best for Astro:** Already static-first

### Implementation Layers

#### Layer 1: Frontend (GitHub Pages)
```
Repository: flaco
Branch: main
Deployment: Automatic to GitHub Pages
What it serves: Built Astro site (HTML/CSS/JS)
```

#### Layer 2: API Gateway (Cloudflare Workers)
```
Route pattern: api.example.com/*
Authentication validation
CORS header injection
Request proxying to Supabase
File upload presigning
Rate limiting
```

#### Layer 3: Backend Services (Supabase)
```
PostgreSQL database (analytics, user data)
Auth (JWT tokens, user sessions)
Storage (media uploads, images)
Realtime subscriptions (optional)
```

### Cost Breakdown
```
GitHub Pages:        $0/month
Cloudflare Worker:   $0-5/month (100K-3M requests)
Supabase Starter:    $25/month
  - 8GB database
  - 5M API calls
  - 1GB storage
  - Auth included
─────────────────────────────
Total:               $25-30/month
```

### Setup Steps
1. Build frontend → Deployed to GitHub Pages
2. Create Supabase project → Get API keys
3. Create Cloudflare Worker → Routes /api/* to Supabase
4. Add JWT validation → Secure endpoints
5. Frontend calls /api/analytics → Workers proxy to Supabase

### Security Considerations
```
✓ CORS: Workers add headers
✓ Auth: JWT in Authorization header
✓ Storage: Supabase RLS policies
✓ Rate limit: Cloudflare Workers script
✓ Secrets: Environment variables in Supabase + Workers
```

---

## 8. Alternative Scenarios

### Scenario A: Minimal Budget ($0)
**Stack:** GitHub Pages + GitHub API + GitHub Actions

**Limitations:**
- Rate limited to 60 requests/hour
- Updates delayed by build time
- No real-time features
- Manual update process

**When:** Personal projects, low traffic

---

### Scenario B: Maximum Simplicity
**Stack:** GitHub Pages + Firebase

**Why Firebase:**
- One SDK for everything (auth + DB + storage)
- Real-time subscriptions included
- No infrastructure management

**Cost:** $10-50/month (as you scale)
**Tradeoff:** More vendor lock-in

---

### Scenario C: Self-Hosted (PocketBase)
**Stack:** GitHub Pages + Self-hosted PocketBase

**Setup:**
```
Deploy PocketBase to: Railway.app ($7/month)
  - PostgreSQL included
  - Auth built-in
  - Storage included
  - API auto-generated

GitHub Pages calls: https://pocketbase.railway.app/api/*
```

**Pros:** No Supabase vendor lock-in, full control
**Cons:** Maintenance responsibility, slower than edge

**Cost:** $7/month (Railway) + $0 GitHub Pages

---

## 9. Migration Path

### If starting fresh
**Recommended:** Supabase + Cloudflare Workers (7.1)

### If already on GitHub Pages with static content
**Phase 1:** Add Supabase for data storage
**Phase 2:** Add Cloudflare Workers for API layer
**Phase 3:** Enable real-time features (optional)

### If already using Firebase
**Decision:** Firebase sufficient, no need to migrate

### If already on Vercel
**Decision:** Stay on Vercel Edge Functions (simpler)

---

## 10. Implementation Examples

### Example 1: Upload Endpoint (Workers)
```typescript
export default {
  async fetch(request, env) {
    if (request.method === 'POST' && request.url.includes('/api/upload')) {
      const token = request.headers.get('Authorization')?.split(' ')[1]

      // Validate token against Supabase
      const { data: user, error } = await fetch(
        `${env.SUPABASE_URL}/auth/v1/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => r.json())

      if (error) return new Response('Unauthorized', { status: 401 })

      // Generate presigned URL
      const presignedUrl = await generateSupabasePresignedUrl(
        env.SUPABASE_KEY,
        env.SUPABASE_URL,
        request.body
      )

      return new Response(JSON.stringify({ url: presignedUrl }))
    }
  }
}
```

### Example 2: Analytics Dashboard (Frontend)
```typescript
// Running on GitHub Pages
const token = localStorage.getItem('supabase_token')

const response = await fetch('https://api.example.com/analytics', {
  headers: { Authorization: `Bearer ${token}` }
})

const analytics = await response.json()
```

---

## 11. Unresolved Questions

1. **Real-time requirements:** Do analytics need sub-minute updates or can they be hourly?
2. **User count:** Solo admin or multiple team members? (Affects auth complexity)
3. **Media size:** Individual file limits and storage volume?
4. **Existing infrastructure:** Any legacy systems to integrate with?
5. **Data residency:** Any compliance requirements (GDPR, location)?

---

## Summary Table

| Approach | Cost | Setup Time | Performance | Real-time | Recommendation |
|----------|------|-----------|-------------|-----------|-----------------|
| **GitHub Pages only** | $0 | 5 min | ⭐⭐⭐⭐⭐ | ❌ | Static content only |
| **+ GitHub Actions/API** | $0 | 30 min | ⭐⭐⭐⭐ | Hourly | Low-traffic blogs |
| **+ Cloudflare Workers** | $5 | 1 hour | ⭐⭐⭐⭐⭐ | Minutes | High-traffic dashboards |
| **+ Supabase** | $25 | 2 hours | ⭐⭐⭐⭐ | Seconds | Feature-rich apps |
| **+ Firebase** | $10-50 | 1.5 hours | ⭐⭐⭐⭐ | Seconds | Rapid prototyping |
| **Full serverless** | $50+ | 3+ hours | ⭐⭐⭐⭐⭐ | Milliseconds | Enterprise scale |

---

## Final Recommendation

**For Flaco Admin Dashboard: Use GitHub Pages + Supabase + Optional Cloudflare Workers**

**Why:**
- ✓ Keep static site on GitHub Pages (zero cost)
- ✓ Supabase provides complete backend (auth, DB, storage)
- ✓ Can add Workers later if needed for performance optimization
- ✓ Clear migration path if requirements grow
- ✓ Reasonable cost ($25-30/month for production)

**Next Steps:**
1. Create Supabase project
2. Set up authentication in Supabase
3. Build admin dashboard frontend in Astro
4. Implement API calls to Supabase from frontend
5. Add Row-Level Security policies in Supabase
6. (Optional) Add Cloudflare Workers for rate limiting and CORS handling

---

## References & Further Reading

**Cloudflare Workers:**
- Getting Started: workers.cloudflare.com
- Pricing: $5/month, 100K requests/day free
- Best for: API gateway, CORS proxy, edge caching

**Supabase:**
- Documentation: supabase.com/docs
- Pricing: $25/month starter plan
- Includes: PostgreSQL, Auth, Storage, Realtime

**Netlify Functions:**
- Documentation: netlify.com/products/functions
- Pricing: Free tier 125K/month, $19/month pro
- Best for: Scheduled functions, form processing

**Vercel Edge Functions:**
- Documentation: vercel.com/docs/edge-functions
- Pricing: $20/month (includes team, functions)
- Best for: Next.js projects

**GitHub Actions:**
- Documentation: github.com/features/actions
- Pricing: 2000 min/month free
- Best for: Scheduled builds, CI/CD

