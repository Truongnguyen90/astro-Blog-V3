# Codebase Structure Analysis

**Date:** 2025-12-30
**Project:** Flaco Admin Dashboard
**Analyst:** Scout Agent

## Project Overview

**Framework:** Astro 5.16.6
**Styling:** Tailwind CSS 4.1.18
**Testing:** Vitest with Happy-DOM
**Deployment:** GitHub Pages (static)

## Directory Structure

```
flaco/
├── src/
│   ├── components/
│   │   ├── fundations/        # Core reusable components
│   │   │   ├── containers/    # Wrapper components
│   │   │   ├── elements/      # Button, Text, Link
│   │   │   ├── head/          # SEO, Meta, Favicons
│   │   │   ├── icons/         # Icon components
│   │   │   └── scripts/       # Client scripts
│   │   ├── assets/            # Logo, ThemeToggle, ScrollUpButton
│   │   ├── blog/              # Blog-specific components
│   │   ├── global/            # Navigation, Footer, ContactCta
│   │   ├── landing/           # Landing page components
│   │   ├── projects/          # Project components
│   │   ├── stack/             # Stack/tech components
│   │   ├── store/             # Store components
│   │   └── work/              # Work/portfolio components
│   ├── content/               # Content collections
│   │   ├── authors/           # Author profiles
│   │   ├── posts/             # Blog posts (markdown)
│   │   ├── projects/          # Project entries
│   │   ├── store/             # Store items
│   │   ├── work/              # Work portfolio
│   │   └── config.ts          # Collection schemas (Zod)
│   ├── images/                # Image assets
│   ├── layouts/               # Page layouts
│   ├── pages/                 # Route pages
│   ├── styles/                # Global CSS (Tailwind v4)
│   └── utils/                 # Utility functions (NEW)
├── public/                    # Static assets
├── .github/workflows/         # CI/CD pipelines
└── vitest.config.ts           # Test configuration
```

## Existing Component Patterns

### Foundation Components
- **Wrapper**: Layout container with variants
- **Button**: Variants (primary/secondary), sizes (small/medium)
- **Text**: Flexible typography with tag prop, variants
- **Link**: Styled link component

### Theme System
- **Dark Mode**: Toggle in navigation, localStorage persistence
- **Tailwind v4**: CSS variables in `src/styles/global.css`
- No `tailwind.config.mjs` (Tailwind v4 pattern)

## Content Collections (Zod Schemas)

1. **posts**: Blog posts (title, pubDate, description, author, image, tags)
2. **work**: Portfolio items (title, subtitle, pubDate, live, image)
3. **projects**: Projects (title, subtitle, pubDate, live, logo, image)
4. **store**: Store items (price, title, features, images, checkout)
5. **authors**: Author profiles (name, role, bio, image, socials)

## Technology Stack

### Core Dependencies
- `astro`: 5.16.6
- `tailwindcss`: 4.1.18 + Vite plugin
- `@astrojs/sitemap`: 3.6.0
- `@astrojs/rss`: 4.0.14
- `@astrolib/seo`: 1.0.0-beta.8

### Dev Dependencies
- `typescript`: 5.9.3
- `@astrojs/check`: 0.9.6 (type checking)
- `vitest`: 4.0.16 (testing)
- `@vitest/ui`: 4.0.16
- `happy-dom`: 20.0.11

### Quality Tools
- ✅ Type checking: `npm run check`
- ✅ Testing: `npm run test`
- ✅ CI/CD: GitHub Actions (tests + deploy)

## Key Findings for Admin Dashboard

### ✅ Strengths
1. **Well-structured component library** - Can reuse Button, Text, Wrapper
2. **Tailwind v4 ready** - CSS variables approach aligns with admin needs
3. **Content collections** - Easy to query/display in admin
4. **Type-safe** - Strong TypeScript + Zod schemas
5. **CI/CD pipeline** - Ready for admin route deployment

### ⚠️ Considerations
1. **No React yet** - Pure Astro components (need to add React integration)
2. **Static-only** - No API routes (GitHub Pages limitation)
3. **No auth system** - Need client-side solution
4. **No backend** - Must use external services or static data

### 🎯 Integration Points

**Where to add admin:**
```
src/
├── pages/
│   └── admin/              # NEW: Admin routes
│       ├── index.astro     # Dashboard home
│       ├── login.astro     # Auth page
│       ├── posts/          # Content management
│       ├── media/          # File uploads
│       └── analytics/      # Stats view
├── components/
│   └── admin/              # NEW: Admin components
│       ├── AuthGuard.tsx   # React island for auth
│       ├── MediaUpload.tsx # React island for uploads
│       ├── StatsCard.astro # Static widget
│       └── DataTable.astro # Static table
└── utils/
    └── admin/              # NEW: Admin utilities
        ├── auth.ts         # Auth helpers
        └── api.ts          # API wrappers
```

## Recommended Architecture

### Static Admin Pattern
- **Authentication**: Client-side (GitHub OAuth via GitHub Pages compatible service)
- **Data Display**: Server-rendered Astro (fast, SEO-friendly)
- **Interactivity**: Strategic React islands (file upload, live search)
- **Storage**: External (Supabase, PocketBase) or GitHub API
- **Analytics**: Pre-computed JSON at build time

### Component Strategy
1. **Reuse existing**: Wrapper, Button, Text, Link
2. **New Astro components**: DataTable, StatsCard, ContentList
3. **React islands only for**:
   - File upload widget
   - Live search/filter
   - Rich text editor (if needed)

### Bundle Size Optimization
- Keep React islands minimal
- Use `client:load` sparingly
- Prefer `client:visible` for below-fold content
- Use `client:idle` for non-critical features

## Next Steps

1. Add `@astrojs/react` integration
2. Install auth library (research findings pending)
3. Create admin layout template
4. Build auth guard component
5. Implement content display tables
6. Add media upload React island

---

**Analysis Complete**
Ready for architecture design phase.
