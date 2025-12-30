# Admin Dashboard Implementation Plan

**Project:** Flaco Admin Dashboard
**Date:** 2025-12-30
**Status:** Ready for Implementation
**Estimated Duration:** Implementation ready to begin in phases

---

## Executive Summary

Build lightweight admin dashboard for Flaco blog using hybrid architecture:
- **Frontend:** Astro 5.16.6 SSG + strategic React islands
- **Backend:** Supabase (auth, database, storage)
- **API Layer:** Optional Cloudflare Workers for custom logic
- **Deployment:** GitHub Pages (static) + external services
- **Cost:** $25-30/month (Supabase Pro plan)
- **Bundle Target:** <200KB JS total, <150KB for admin features

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth** | Supabase Auth | OAuth + magic links, 50K MAU free, RLS built-in |
| **Database** | Supabase Postgres | Managed, RLS security, real-time subscriptions |
| **Storage** | Supabase Storage | Image optimization, CDN, access policies |
| **API Layer** | Cloudflare Workers (optional) | Edge compute for custom logic if needed |
| **Interactivity** | React islands with `client:visible` | Minimal JS, progressive enhancement |
| **Styling** | Existing Tailwind CSS + CSS vars | Reuse theme, consistent with blog |

---

## Technical Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       GitHub Pages                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Astro Static Site (dist/)                           │  │
│  │  ├── /blog (existing)                                │  │
│  │  └── /admin (new)                                    │  │
│  │      ├── login.html        [Static HTML]             │  │
│  │      ├── index.html        [Static + React islands]  │  │
│  │      ├── media.html        [React island heavy]      │  │
│  │      └── analytics.html    [Static + charts]         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase BaaS                            │
│  ┌──────────────────┬──────────────────┬─────────────────┐ │
│  │  Auth Service    │  PostgreSQL DB   │  Storage Bucket │ │
│  │  - OAuth         │  - RLS Policies  │  - Images       │ │
│  │  - Magic Links   │  - analytics     │  - Media files  │ │
│  │  - JWT tokens    │  - media_meta    │  - CDN delivery │ │
│  └──────────────────┴──────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ Optional for custom logic
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Optional)                  │
│  - Custom webhooks                                          │
│  - Image processing                                         │
│  - Rate limiting                                            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Authentication Flow:**
1. User visits `/admin/login`
2. Clicks OAuth provider or enters email (magic link)
3. Supabase handles auth, returns JWT
4. Client stores JWT in localStorage
5. Protected routes check JWT via `AuthGuard.tsx` React island

**Media Upload Flow:**
1. User drops file in `MediaUpload.tsx` React island
2. Client-side validation (size, type)
3. Upload to Supabase Storage bucket
4. Insert metadata to `media_meta` table (RLS protected)
5. Optimized URL returned from CDN

**Analytics Flow:**
1. Build-time: Aggregate content stats to JSON
2. Runtime: Query Supabase for view counts (if tracking added)
3. Render charts using static HTML + minimal JS

---

## Phase Breakdown

### Phase 1: Foundation Setup (Priority: Critical)

**Goal:** Configure Supabase project and React integration in Astro

**Tasks:**
1. Create Supabase project at https://supabase.com
2. Configure authentication providers (GitHub, Google, Email)
3. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @astrojs/react react react-dom
   ```
4. Add React integration to `astro.config.mjs`:
   ```js
   import react from '@astrojs/react';
   export default defineConfig({
     integrations: [react()],
   });
   ```
5. Create environment variables:
   ```env
   PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```
6. Create Supabase client utility: `src/utils/admin/supabase.ts`

**Deliverables:**
- `C:\Users\truon\flaco\astro.config.mjs` (updated)
- `C:\Users\truon\flaco\.env` (created, gitignored)
- `C:\Users\truon\flaco\src\utils\admin\supabase.ts` (created)

**Dependencies:** None
**Estimated Complexity:** Low

---

### Phase 2: Authentication Implementation (Priority: Critical)

**Goal:** Secure admin routes with Supabase authentication

**Tasks:**
1. Create login page: `src/pages/admin/login.astro`
2. Build `AuthProvider.tsx` React context:
   - Manage auth state
   - Handle login/logout
   - Persist session
3. Build `AuthGuard.tsx` wrapper component:
   - Check JWT validity
   - Redirect to login if unauthenticated
   - Show loading state
4. Create auth utilities:
   - `src/utils/admin/auth.ts` (session helpers)
   - `src/utils/admin/protected-route.ts` (HOC for protection)
5. Add logout button to admin navigation

**Implementation Example:**

```typescript
// src/utils/admin/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

```tsx
// src/components/admin/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/admin/supabase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!session) {
    window.location.href = '/admin/login';
    return null;
  }

  return <>{children}</>;
}
```

**Deliverables:**
- `src/pages/admin/login.astro`
- `src/components/admin/AuthProvider.tsx`
- `src/components/admin/AuthGuard.tsx`
- `src/utils/admin/auth.ts`
- `src/layouts/AdminLayout.astro`

**Dependencies:** Phase 1
**Estimated Complexity:** Medium

**Security Checklist:**
- ✅ JWT stored in httpOnly cookie (Supabase handles this)
- ✅ CSRF protection via Supabase SDK
- ✅ Redirect to login for unauthenticated requests
- ✅ Session refresh handled automatically

---

### Phase 3: Admin Layout & Navigation (Priority: High)

**Goal:** Create consistent admin interface using existing components

**Tasks:**
1. Create `AdminLayout.astro` base layout:
   - Reuse `Wrapper` from `src/components/fundations/containers/`
   - Sidebar navigation
   - Dark mode toggle (existing component)
   - Logout button
2. Create admin navigation component:
   - Dashboard, Media, Analytics links
   - Active state styling
   - Mobile-responsive hamburger menu
3. Create dashboard homepage: `src/pages/admin/index.astro`
4. Style using Tailwind CSS (existing theme)
5. Add admin route to sitemap exclusion

**Layout Structure:**

```astro
---
// src/layouts/AdminLayout.astro
import Wrapper from '@/components/fundations/containers/Wrapper.astro';
import ThemeToggle from '@/components/assets/ThemeToggle.astro';
import { AuthGuard } from '@/components/admin/AuthGuard';

interface Props {
  title: string;
}
const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <title>{title} - Admin</title>
  </head>
  <body>
    <AuthGuard client:load>
      <div class="admin-layout">
        <aside class="sidebar">
          <nav>
            <a href="/admin">Dashboard</a>
            <a href="/admin/media">Media</a>
            <a href="/admin/analytics">Analytics</a>
          </nav>
          <ThemeToggle />
        </aside>
        <main class="content">
          <Wrapper>
            <slot />
          </Wrapper>
        </main>
      </div>
    </AuthGuard>
  </body>
</html>
```

**Deliverables:**
- `src/layouts/AdminLayout.astro`
- `src/components/admin/AdminNav.astro`
- `src/pages/admin/index.astro` (dashboard home)
- `src/styles/admin.css` (admin-specific styles)

**Dependencies:** Phase 2
**Estimated Complexity:** Low

---

### Phase 4: Dashboard Analytics View (Priority: Medium)

**Goal:** Display content statistics and site metrics

**Tasks:**
1. Create static analytics aggregator:
   - Count posts, projects, work items at build time
   - Generate `public/admin-stats.json`
2. Create `StatsCard.astro` component:
   - Display metric with icon
   - Reuse `Text` component for typography
   - Reuse `Button` component for actions
3. Create analytics page: `src/pages/admin/analytics.astro`
4. Add content breakdown:
   - Posts by category
   - Recent updates
   - Popular tags
5. Optional: Add chart library for visualizations (Chart.js or Recharts)

**Implementation Example:**

```typescript
// src/utils/admin/build-stats.ts
import { getCollection } from 'astro:content';

export async function generateAdminStats() {
  const posts = await getCollection('posts');
  const projects = await getCollection('projects');
  const work = await getCollection('work');

  return {
    posts: {
      total: posts.length,
      published: posts.filter(p => p.data.pubDate <= new Date()).length,
      tags: [...new Set(posts.flatMap(p => p.data.tags || []))].length
    },
    projects: {
      total: projects.length,
      live: projects.filter(p => p.data.live).length
    },
    work: {
      total: work.length
    },
    lastUpdated: new Date().toISOString()
  };
}
```

```astro
---
// src/components/admin/StatsCard.astro
import Text from '@/components/fundations/elements/Text.astro';

interface Props {
  label: string;
  value: number;
  icon?: string;
  trend?: 'up' | 'down';
}
const { label, value, icon, trend } = Astro.props;
---

<div class="stats-card">
  {icon && <span class="icon">{icon}</span>}
  <Text tag="h3" variant="h3">{label}</Text>
  <Text tag="p" variant="display">{value}</Text>
  {trend && <span class={`trend trend-${trend}`}>↑</span>}
</div>
```

**Deliverables:**
- `src/utils/admin/build-stats.ts`
- `src/components/admin/StatsCard.astro`
- `src/pages/admin/analytics.astro`
- `public/admin-stats.json` (generated at build)

**Dependencies:** Phase 3
**Estimated Complexity:** Low

---

### Phase 5: Media Management (Priority: High)

**Goal:** Upload, browse, and manage media files via Supabase Storage

**Tasks:**
1. Configure Supabase Storage bucket:
   - Create `media` bucket
   - Set access policies (authenticated users only)
   - Enable image optimization
2. Create database schema for media metadata:
   ```sql
   CREATE TABLE media_meta (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     filename TEXT NOT NULL,
     url TEXT NOT NULL,
     size INTEGER NOT NULL,
     mime_type TEXT NOT NULL,
     uploaded_by UUID REFERENCES auth.users(id),
     uploaded_at TIMESTAMPTZ DEFAULT NOW(),
     alt_text TEXT,
     tags TEXT[]
   );

   -- RLS Policies
   ALTER TABLE media_meta ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Authenticated users can view media"
     ON media_meta FOR SELECT
     USING (auth.role() = 'authenticated');
   CREATE POLICY "Authenticated users can upload media"
     ON media_meta FOR INSERT
     WITH CHECK (auth.role() = 'authenticated');
   ```
3. Build `MediaUpload.tsx` React island:
   - Drag-and-drop zone
   - File validation (type, size)
   - Progress indicator
   - Upload to Supabase Storage
   - Insert metadata to database
4. Build `MediaGallery.tsx` React island:
   - Grid layout with thumbnails
   - Search/filter by filename, tags
   - Copy URL to clipboard
   - Delete functionality (with confirmation)
5. Create media management page: `src/pages/admin/media.astro`
6. Use `client:visible` directive for React islands

**Implementation Example:**

```tsx
// src/components/admin/MediaUpload.tsx
import { useState } from 'react';
import { supabase } from '@/utils/admin/supabase';

export function MediaUpload() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);

    // Upload to Supabase Storage
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filename, file);

    if (error) {
      console.error('Upload failed:', error);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filename);

    // Insert metadata
    await supabase.from('media_meta').insert({
      filename: file.name,
      url: publicUrl,
      size: file.size,
      mime_type: file.type
    });

    setUploading(false);
  };

  return (
    <div className="media-upload">
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <div>Uploading...</div>}
    </div>
  );
}
```

**Deliverables:**
- Supabase Storage bucket configuration
- Database schema for `media_meta` table
- `src/components/admin/MediaUpload.tsx`
- `src/components/admin/MediaGallery.tsx`
- `src/pages/admin/media.astro`
- `src/utils/admin/media.ts` (helper functions)

**Dependencies:** Phase 2
**Estimated Complexity:** High

**Performance Notes:**
- React islands add ~80KB gzipped (React + Supabase client)
- Use `client:visible` to defer loading until scrolled into view
- Image optimization handled by Supabase CDN

---

### Phase 6: Content Overview Tables (Priority: Medium)

**Goal:** Display content collections in filterable tables

**Tasks:**
1. Create `ContentTable.astro` static component:
   - Display posts, projects, work items
   - Sort by date, title
   - Link to edit page (future enhancement)
2. Add lightweight client-side search:
   - Filter by title, tags (no React needed)
   - Use vanilla JS or Alpine.js
3. Create content overview pages:
   - `src/pages/admin/posts.astro`
   - `src/pages/admin/projects.astro`
4. Reuse existing `Text` and `Link` components

**Implementation Example:**

```astro
---
// src/pages/admin/posts.astro
import AdminLayout from '@/layouts/AdminLayout.astro';
import ContentTable from '@/components/admin/ContentTable.astro';
import { getCollection } from 'astro:content';

const posts = await getCollection('posts');
const sortedPosts = posts.sort((a, b) =>
  b.data.pubDate.getTime() - a.data.pubDate.getTime()
);
---

<AdminLayout title="Manage Posts">
  <h1>Blog Posts ({posts.length})</h1>
  <ContentTable
    items={sortedPosts}
    columns={['title', 'pubDate', 'author', 'tags']}
  />
</AdminLayout>
```

```astro
---
// src/components/admin/ContentTable.astro
import Text from '@/components/fundations/elements/Text.astro';
import Link from '@/components/fundations/elements/Link.astro';

interface Props {
  items: any[];
  columns: string[];
}
const { items, columns } = Astro.props;
---

<div class="content-table">
  <input
    type="search"
    placeholder="Search..."
    class="search-input"
    data-table-search
  />
  <table>
    <thead>
      <tr>
        {columns.map(col => <th>{col}</th>)}
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr>
          {columns.map(col => (
            <td>
              {col === 'title' ? (
                <Link href={`/blog/${item.slug}`}>{item.data[col]}</Link>
              ) : (
                <Text tag="span">{item.data[col]}</Text>
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

<script>
  // Lightweight vanilla JS search
  const searchInput = document.querySelector('[data-table-search]');
  const rows = document.querySelectorAll('tbody tr');

  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    rows.forEach(row => {
      const text = row.textContent?.toLowerCase() || '';
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
</script>
```

**Deliverables:**
- `src/components/admin/ContentTable.astro`
- `src/pages/admin/posts.astro`
- `src/pages/admin/projects.astro`
- `src/pages/admin/work.astro`

**Dependencies:** Phase 3
**Estimated Complexity:** Low

**Bundle Impact:** +2KB (vanilla JS search)

---

### Phase 7: Testing & Quality Assurance (Priority: Critical)

**Goal:** Ensure admin dashboard meets quality standards

**Tasks:**
1. Write Vitest tests for utilities:
   - `src/utils/admin/supabase.test.ts`
   - `src/utils/admin/auth.test.ts`
   - `src/utils/admin/media.test.ts`
2. Add React Testing Library for component tests:
   ```bash
   npm install -D @testing-library/react @testing-library/user-event
   ```
3. Test authentication flows:
   - Login success/failure
   - Session persistence
   - Logout
4. Test media upload:
   - File validation
   - Upload progress
   - Error handling
5. Manual testing checklist:
   - [ ] Login with GitHub OAuth
   - [ ] Login with magic link
   - [ ] Upload image to media library
   - [ ] View analytics dashboard
   - [ ] Search content tables
   - [ ] Dark mode toggle
   - [ ] Mobile responsiveness
6. Lighthouse audit:
   - Target: Performance >90, Accessibility >95
   - Check bundle size (<200KB total JS)

**Test Example:**

```typescript
// src/utils/admin/auth.test.ts
import { describe, it, expect, vi } from 'vitest';
import { supabase } from './supabase';
import { checkAuth } from './auth';

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    }
  }
}));

describe('Admin Auth', () => {
  it('should return session if authenticated', async () => {
    const mockSession = { user: { id: '123' } };
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    const result = await checkAuth();
    expect(result).toEqual(mockSession);
  });

  it('should return null if not authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    });

    const result = await checkAuth();
    expect(result).toBeNull();
  });
});
```

**Deliverables:**
- Test files for all admin utilities
- React component tests for islands
- Manual testing checklist (completed)
- Lighthouse audit report
- Bundle size analysis

**Dependencies:** All previous phases
**Estimated Complexity:** Medium

---

### Phase 8: Deployment & CI/CD Integration (Priority: High)

**Goal:** Deploy admin dashboard with existing GitHub Actions pipeline

**Tasks:**
1. Update `.github/workflows/deploy.yml`:
   - Add Supabase environment variables as GitHub secrets
   - Ensure admin routes are built and deployed
2. Add environment variable configuration:
   ```yaml
   - name: Build with environment variables
     env:
       PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
       PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
     run: npm run build
   ```
3. Configure Supabase project:
   - Add site URL to allowed redirect URLs
   - Set up OAuth providers (GitHub, Google)
   - Create initial admin user
4. Test deployment:
   - Push to main branch
   - Verify admin routes are accessible
   - Check authentication flow in production
5. Document deployment process in README

**GitHub Secrets to Add:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (for migrations, if needed)

**Deliverables:**
- Updated `.github/workflows/deploy.yml`
- Supabase project configuration
- Deployment documentation in README
- Production testing checklist

**Dependencies:** Phase 7
**Estimated Complexity:** Low

---

## File Structure

```
flaco/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Existing
│       └── deploy.yml                # Update for admin
├── src/
│   ├── components/
│   │   ├── admin/                    # NEW: Admin components
│   │   │   ├── AuthGuard.tsx         # React island (client:load)
│   │   │   ├── AuthProvider.tsx      # React context
│   │   │   ├── MediaUpload.tsx       # React island (client:visible)
│   │   │   ├── MediaGallery.tsx      # React island (client:visible)
│   │   │   ├── AdminNav.astro        # Static navigation
│   │   │   ├── StatsCard.astro       # Static widget
│   │   │   └── ContentTable.astro    # Static table
│   │   ├── fundations/               # Existing - REUSE
│   │   │   ├── containers/Wrapper.astro
│   │   │   ├── elements/Button.astro
│   │   │   ├── elements/Text.astro
│   │   │   └── elements/Link.astro
│   │   └── assets/                   # Existing - REUSE
│   │       └── ThemeToggle.astro
│   ├── layouts/
│   │   ├── AdminLayout.astro         # NEW: Admin base layout
│   │   └── Layout.astro              # Existing blog layout
│   ├── pages/
│   │   ├── admin/                    # NEW: Admin routes
│   │   │   ├── login.astro           # Auth page
│   │   │   ├── index.astro           # Dashboard home
│   │   │   ├── media.astro           # Media management
│   │   │   ├── analytics.astro       # Stats view
│   │   │   ├── posts.astro           # Content overview
│   │   │   ├── projects.astro        # Content overview
│   │   │   └── work.astro            # Content overview
│   │   └── [existing blog pages]
│   ├── styles/
│   │   ├── admin.css                 # NEW: Admin-specific styles
│   │   └── global.css                # Existing Tailwind v4
│   ├── utils/
│   │   ├── admin/                    # NEW: Admin utilities
│   │   │   ├── supabase.ts           # Supabase client
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   ├── media.ts              # Media helpers
│   │   │   └── build-stats.ts        # Build-time analytics
│   │   └── [existing utilities]
│   └── content/                      # Existing - READ ONLY
│       ├── posts/
│       ├── projects/
│       └── work/
├── public/
│   └── admin-stats.json              # NEW: Generated at build
├── .env                              # NEW: Environment variables (gitignored)
├── astro.config.mjs                  # Update for React
├── package.json                      # Update dependencies
└── vitest.config.ts                  # Existing - extend for React tests
```

---

## Component Architecture

### Static Astro Components (Server-rendered)

**Advantages:**
- Zero JavaScript bundle
- SEO-friendly
- Fast rendering
- Simple to maintain

**Use for:**
- `AdminLayout.astro` - Base layout wrapper
- `AdminNav.astro` - Navigation menu
- `StatsCard.astro` - Analytics widgets
- `ContentTable.astro` - Content listings
- Login page structure (`login.astro`)

### React Islands (Client-rendered)

**Advantages:**
- Rich interactivity
- State management
- File uploads
- Real-time updates

**Use for:**
- `AuthGuard.tsx` - Session management (client:load)
- `MediaUpload.tsx` - File drag-and-drop (client:visible)
- `MediaGallery.tsx` - Image browsing with search (client:visible)
- `AuthProvider.tsx` - Auth context provider (client:load)

**Client Directive Strategy:**
- `client:load` - Critical auth components (AuthGuard, AuthProvider)
- `client:visible` - Below-fold content (MediaUpload, MediaGallery)
- `client:idle` - Non-critical features (analytics charts if added)

**Bundle Size Breakdown:**
```
React core:                    ~45KB gzipped
@supabase/supabase-js:         ~35KB gzipped
Admin components:              ~15KB gzipped
Supabase auth helpers:         ~5KB gzipped
-------------------------------------------
Total admin JS bundle:         ~100KB gzipped

Existing blog bundle:          ~30KB gzipped
Total site JS (worst case):    ~130KB gzipped
```

**Target:** <150KB total JS, <200KB if adding chart library

---

## Database Schema

### Supabase Tables

**1. media_meta (Media Metadata)**
```sql
CREATE TABLE media_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  alt_text TEXT,
  tags TEXT[],
  CONSTRAINT valid_size CHECK (size > 0 AND size < 10485760) -- 10MB limit
);

-- Indexes
CREATE INDEX idx_media_uploaded_at ON media_meta(uploaded_at DESC);
CREATE INDEX idx_media_uploaded_by ON media_meta(uploaded_by);
CREATE INDEX idx_media_tags ON media_meta USING GIN(tags);

-- RLS Policies
ALTER TABLE media_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view media"
  ON media_meta FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload media"
  ON media_meta FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own media"
  ON media_meta FOR DELETE
  USING (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);
```

**2. analytics_events (Optional - if tracking views)**
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'download', etc.
  page_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_hash TEXT -- Hashed for privacy
);

-- Indexes
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_page_path ON analytics_events(page_path);

-- RLS: No policies needed (insert-only from public)
```

### Supabase Storage Buckets

**1. media (Image/File Storage)**
```javascript
// Bucket configuration
{
  name: 'media',
  public: true,
  fileSizeLimit: 10485760, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf'
  ]
}

// Storage policies
CREATE POLICY "Authenticated users can upload to media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Public access to media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media' AND
    auth.uid() = owner
  );
```

---

## Security Considerations

### Authentication Security

1. **JWT Token Management:**
   - Tokens stored in httpOnly cookies (Supabase default)
   - Automatic refresh before expiration
   - Logout clears all session data

2. **Row-Level Security (RLS):**
   - All tables have RLS enabled
   - Users can only access their own data
   - Admin role can be added via Supabase custom claims

3. **OAuth Security:**
   - Use official provider SDKs (GitHub, Google)
   - Validate redirect URLs in Supabase dashboard
   - Implement PKCE flow for mobile apps (future)

4. **Rate Limiting:**
   - Supabase has built-in rate limiting (100 req/sec)
   - Optional: Add Cloudflare Workers rate limiting

### Input Validation

1. **File Upload Validation:**
   ```typescript
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
   const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

   function validateFile(file: File): string | null {
     if (file.size > MAX_FILE_SIZE) {
       return 'File too large (max 10MB)';
     }
     if (!ALLOWED_TYPES.includes(file.type)) {
       return 'Invalid file type';
     }
     return null;
   }
   ```

2. **SQL Injection Prevention:**
   - Supabase client uses parameterized queries
   - No raw SQL in application code

3. **XSS Prevention:**
   - Astro auto-escapes HTML by default
   - React sanitizes user input
   - CSP headers in deployment

### Environment Variables

**Never commit to Git:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

**GitHub Secrets:**
```bash
gh secret set SUPABASE_URL --body "https://xxx.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "eyJxxx..."
```

**Local Development:**
```env
# .env (gitignored)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Performance Optimization

### Bundle Size Strategy

**Baseline (No Admin):**
- Astro core: ~10KB
- Tailwind CSS: ~8KB (purged)
- Blog components: ~12KB
- **Total:** ~30KB gzipped

**With Admin (Worst Case):**
- React core: ~45KB
- Supabase client: ~35KB
- Admin components: ~15KB
- **Total:** ~125KB gzipped

**Optimization Techniques:**

1. **Code Splitting:**
   ```astro
   ---
   // Only load React on admin routes
   import { MediaUpload } from '@/components/admin/MediaUpload';
   ---

   {Astro.url.pathname.startsWith('/admin') && (
     <MediaUpload client:visible />
   )}
   ```

2. **Lazy Loading:**
   ```tsx
   import { lazy } from 'react';
   const MediaGallery = lazy(() => import('./MediaGallery'));
   ```

3. **Tree Shaking:**
   ```typescript
   // Import only what you need
   import { createClient } from '@supabase/supabase-js';
   // NOT: import * as Supabase from '@supabase/supabase-js';
   ```

4. **Image Optimization:**
   - Supabase Storage auto-generates WebP
   - Use `<img loading="lazy">` for below-fold images
   - Set explicit width/height to prevent layout shift

### Loading Performance

**Lighthouse Score Targets:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: 100

**Critical Rendering Path:**
1. HTML loads (server-rendered Astro)
2. Tailwind CSS loads (inline critical CSS)
3. Auth check (React island hydrates)
4. Media components load on scroll (client:visible)

**Time to Interactive (TTI):**
- Target: <3 seconds on 3G
- Admin routes can be slower than blog (acceptable trade-off)

---

## Cost Analysis

### Supabase Pro Plan ($25/month)

**Included:**
- Database: 8GB storage, 100GB bandwidth
- Auth: 50,000 Monthly Active Users (MAU)
- Storage: 100GB, 200GB bandwidth
- Realtime: 500 concurrent connections
- Edge Functions: 500K requests/month

**Usage Estimates:**
- Database: <1GB (mostly metadata)
- Auth: <100 MAU (admin users only)
- Storage: ~10GB (images, media)
- Bandwidth: ~50GB/month (CDN delivery)

**Scaling:**
- 100-500 MAU: $25/month (Pro plan)
- 500-5,000 MAU: $599/month (Team plan)
- 5,000+ MAU: Custom pricing

### Optional: Cloudflare Workers ($5/month)

**Use Cases:**
- Custom webhooks
- Image processing
- Rate limiting
- Proxy to third-party APIs

**Included:**
- 10M requests/month
- 50ms CPU time per request
- KV storage (1GB)

**Total Monthly Cost:**
- **Minimum:** $25/month (Supabase only)
- **Recommended:** $30/month (Supabase + Workers)

---

## Testing Strategy

### Unit Tests (Vitest)

**Coverage Targets:**
- Utilities: 80%+ coverage
- Components: 60%+ coverage (focus on logic)

**Test Files:**
```
src/utils/admin/
├── supabase.test.ts       # Client initialization
├── auth.test.ts           # Session helpers
├── media.test.ts          # Upload validation
└── build-stats.test.ts    # Analytics aggregation

src/components/admin/
├── AuthGuard.test.tsx     # Auth logic
├── MediaUpload.test.tsx   # File validation
└── ContentTable.test.tsx  # Search filtering
```

### Integration Tests

**Manual Test Checklist:**

**Authentication:**
- [ ] Login with GitHub OAuth redirects correctly
- [ ] Login with magic link sends email
- [ ] Session persists on page reload
- [ ] Logout clears session
- [ ] Unauthenticated users redirect to /admin/login

**Media Management:**
- [ ] Drag-and-drop uploads file
- [ ] File validation rejects invalid types
- [ ] Upload progress shows correctly
- [ ] Uploaded images appear in gallery
- [ ] Copy URL button works
- [ ] Delete button removes file

**Analytics:**
- [ ] Stats cards show correct counts
- [ ] Content breakdown is accurate
- [ ] Tags list is complete

**Content Tables:**
- [ ] Search filters rows correctly
- [ ] Sort by date works
- [ ] Links to content are correct

**Responsive Design:**
- [ ] Mobile navigation works
- [ ] Tables scroll horizontally on mobile
- [ ] Upload dropzone works on touch devices

**Dark Mode:**
- [ ] Toggle switches theme
- [ ] Theme persists on reload
- [ ] All admin pages respect theme

### Performance Testing

**Lighthouse Audit:**
```bash
npm run build
npx serve dist
npx lighthouse http://localhost:3000/admin --view
```

**Bundle Size Analysis:**
```bash
npm run build
du -sh dist/_astro/*
```

**Target Metrics:**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Total Blocking Time: <200ms
- Cumulative Layout Shift: <0.1

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm run test:run`)
- [ ] Type checking passes (`npm run check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Lighthouse score >90
- [ ] Bundle size <200KB JS
- [ ] Environment variables documented

### Supabase Configuration

- [ ] Create Supabase project
- [ ] Enable GitHub OAuth in Authentication settings
- [ ] Enable Google OAuth (optional)
- [ ] Add site URL to allowed redirect URLs
- [ ] Create `media` storage bucket
- [ ] Run database migrations (media_meta table)
- [ ] Enable RLS policies
- [ ] Create initial admin user

### GitHub Repository

- [ ] Add secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [ ] Update `deploy.yml` workflow
- [ ] Enable GitHub Pages in repository settings
- [ ] Test CI/CD pipeline

### Post-Deployment

- [ ] Test login flow in production
- [ ] Upload test image to media library
- [ ] Verify analytics dashboard loads
- [ ] Check mobile responsiveness
- [ ] Test dark mode toggle
- [ ] Monitor Supabase dashboard for errors
- [ ] Set up uptime monitoring (optional)

---

## Known Limitations

1. **Static Site Constraints:**
   - No server-side rendering for admin pages
   - Auth check happens client-side (potential flash of login page)
   - No API routes in GitHub Pages (must use Supabase/Workers)

2. **Content Management:**
   - Cannot edit markdown files directly from admin
   - Must commit changes via Git (future: GitHub API integration)
   - No WYSIWYG editor (content is markdown in repo)

3. **Scalability:**
   - GitHub Pages has 100GB/month soft bandwidth limit
   - Supabase free tier: 50K MAU (upgrade to Pro for more)
   - No serverless functions without Cloudflare Workers

4. **Browser Support:**
   - React islands require modern browsers (ES2020+)
   - No IE11 support (acceptable for admin dashboard)

---

## Future Enhancements

### Phase 9+ (Optional)

**Content Editing:**
- Integrate GitHub API to edit markdown files
- WYSIWYG editor for posts (Tiptap or ProseMirror)
- Preview before publish

**Advanced Analytics:**
- Real-time visitor tracking (Supabase Realtime)
- Referrer tracking
- Popular posts widget
- Export to CSV

**User Management:**
- Multi-user support with roles (admin, editor, viewer)
- User invitation system
- Activity logs

**Media Library Enhancements:**
- Bulk upload
- Image cropping/editing (Cloudflare Images)
- AI alt text generation (OpenAI API)
- Folder organization

**Performance Monitoring:**
- Sentry integration for error tracking
- Vercel Analytics or Plausible for page views
- Core Web Vitals dashboard

---

## Success Criteria

### Functional Requirements

✅ **Authentication:**
- Admin users can log in via OAuth or magic link
- Session persists across page reloads
- Logout works correctly

✅ **Media Management:**
- Upload images via drag-and-drop
- Browse uploaded media in gallery
- Copy URLs for use in content
- Delete uploaded files

✅ **Analytics:**
- View content statistics (posts, projects, work)
- See recent activity
- Identify popular tags

✅ **Content Overview:**
- List all posts, projects, work items
- Search/filter content
- Link to published content

✅ **Responsive Design:**
- Works on mobile, tablet, desktop
- Dark mode support
- Accessible (WCAG AA)

### Non-Functional Requirements

✅ **Performance:**
- Lighthouse score >90
- Bundle size <200KB JS
- TTI <3 seconds on 3G

✅ **Security:**
- RLS policies on all tables
- JWT authentication
- Input validation

✅ **Maintainability:**
- Type-safe TypeScript
- 80%+ test coverage on utilities
- Documentation for all components

✅ **Cost:**
- <$50/month for 100 MAU
- Scales to 500 MAU without code changes

---

## Getting Started

### Step 1: Install Dependencies

```bash
cd C:\Users\truon\flaco
npm install @supabase/supabase-js @astrojs/react react react-dom
npm install -D @testing-library/react @testing-library/user-event
```

### Step 2: Configure Supabase

1. Create project at https://supabase.com/dashboard
2. Go to Settings > API
3. Copy `Project URL` and `anon public` key
4. Create `.env` file:
   ```env
   PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

### Step 3: Update Astro Config

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
```

### Step 4: Start Development

```bash
npm run dev
```

Navigate to `http://localhost:4321/admin/login` to begin testing.

### Step 5: Follow Phases

Implement phases 1-8 sequentially. Each phase builds on the previous.

---

## Questions & Answers

**Q: Why Supabase over other BaaS providers?**
A: Supabase offers the best balance of features, pricing, and developer experience for this use case. It includes auth, database, storage, and real-time in one platform. Alternatives like Firebase or Auth0 would require multiple services.

**Q: Can I use a different deployment platform?**
A: Yes. The admin dashboard works on any static host (Vercel, Netlify, Cloudflare Pages). Just update environment variables and OAuth redirect URLs accordingly.

**Q: Do I need Cloudflare Workers?**
A: No, it's optional. The admin dashboard works entirely with Supabase. Workers are only needed for custom server-side logic (webhooks, image processing, etc.).

**Q: Can I edit markdown files from the admin?**
A: Not in this initial implementation. Content editing requires GitHub API integration (planned for Phase 9+). For now, edit markdown files in your IDE and commit via Git.

**Q: Will this slow down my blog?**
A: No. Admin routes use separate JavaScript bundles that only load on `/admin/*` pages. Your blog remains fast (~30KB JS) with zero impact.

**Q: How do I add more admin users?**
A: Invite users via Supabase Dashboard > Authentication > Invite User. They'll receive a magic link email to set up their account. You can also implement a signup form in Phase 9+.

---

## Support & Resources

**Documentation:**
- Astro: https://docs.astro.build
- Supabase: https://supabase.com/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com

**Community:**
- Astro Discord: https://astro.build/chat
- Supabase Discord: https://discord.supabase.com

**Flaco Project:**
- Repository: https://github.com/Truongnguyen90/astro-Blog-V3
- Issues: https://github.com/Truongnguyen90/astro-Blog-V3/issues

---

## Plan Status

**Created:** 2025-12-30
**Last Updated:** 2025-12-30
**Status:** ✅ Ready for Implementation
**Approved By:** Pending user review

**Next Steps:**
1. Review this plan document
2. Approve architecture decisions
3. Begin Phase 1: Foundation Setup
4. Track progress using TodoWrite

---

**End of Plan**
