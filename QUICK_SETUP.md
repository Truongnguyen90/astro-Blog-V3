# Quick Setup Guide - Flaco Admin Dashboard

Complete these steps to get your admin dashboard fully operational.

---

## ✅ Already Completed

- [x] Environment variables configured (`.env`)
- [x] Development server running at http://localhost:4322
- [x] GitHub Actions workflows created
- [x] SQL scripts prepared

---

## 🔧 Step 1: Configure GitHub OAuth App

1. **Create OAuth App:**
   - Go to: https://github.com/settings/developers
   - Click **"New OAuth App"**
   - Fill in:
     - **Name:** `Flaco Admin Dashboard`
     - **Homepage URL:** `http://localhost:4322`
     - **Callback URL:** `https://embujgkwtuazdcmodqst.supabase.co/auth/v1/callback`
   - Click **"Register application"**

2. **Get Credentials:**
   - Copy the **Client ID**
   - Click **"Generate a new client secret"**
   - Copy the **Client Secret** (you won't see it again!)

3. **Save for next step** ⬇️

---

## 🗄️ Step 2: Configure Supabase

### A. Enable GitHub Provider

1. Go to: https://embujgkwtuazdcmodqst.supabase.co
2. Navigate to **Authentication > Providers**
3. Find **GitHub** and toggle **"Enable"**
4. Paste your **Client ID** and **Client Secret** from Step 1
5. Click **"Save"**

### B. Configure Redirect URLs

1. Go to **Authentication > URL Configuration**
2. Set **Site URL:** `http://localhost:4322`
3. Add **Redirect URLs:**
   ```
   http://localhost:4322/admin
   http://localhost:4322/admin/login
   ```
4. Click **"Save"**

### C. Create Database Table

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Open file: `supabase/database-schema.sql`
4. Copy entire contents and paste into SQL Editor
5. Click **"Run"**
6. ✅ Should see: "media_meta table created successfully!"

### D. Create Storage Bucket

1. Go to **Storage**
2. Click **"Create a new bucket"**
3. Fill in:
   - **Name:** `media`
   - **Public bucket:** ✅ **Enabled**
   - **File size limit:** `10 MB`
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif, image/svg+xml`
4. Click **"Create bucket"**

### E. Configure Storage Policies

1. Open file: `supabase/storage-policies.sql`
2. Go to Supabase **SQL Editor**
3. Click **"New Query"**
4. Copy entire contents and paste
5. Click **"Run"**
6. ✅ Should see: "Storage policies created successfully!"

---

## 🧪 Step 3: Test Locally

1. **Open login page:**
   ```
   http://localhost:4322/admin/login
   ```

2. **Click "Continue with GitHub"**
   - Authorize the app
   - Should redirect to `/admin` dashboard

3. **Test all pages:**
   - `/admin` - Dashboard ✅
   - `/admin/analytics` - Analytics ✅
   - `/admin/posts` - Posts table ✅
   - `/admin/projects` - Projects table ✅
   - `/admin/media` - Upload & gallery ✅

4. **Test media upload:**
   - Go to `/admin/media`
   - Drag & drop an image
   - Should see upload progress
   - Image should appear in gallery
   - Click "Copy URL" - should copy to clipboard
   - Try deleting - should remove from gallery

---

## 🚀 Step 4: Deploy to Production

### A. Verify Anon Key

⚠️ **IMPORTANT:** Your current key format looks unusual.

1. Go to: https://embujgkwtuazdcmodqst.supabase.co
2. Navigate to **Settings > API**
3. Find **anon public** key (should start with `eyJ...`)
4. If different from `.env`, update:
   ```env
   PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

### B. Add GitHub Secrets

1. Go to your repository: **Settings > Secrets and variables > Actions**
2. Click **"New repository secret"**
3. Add these two secrets:

   **Secret 1:**
   - Name: `SUPABASE_URL`
   - Value: `https://embujgkwtuazdcmodqst.supabase.co`

   **Secret 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: `[your anon key from Settings > API]`

### C. Update GitHub OAuth for Production

1. Go back to: https://github.com/settings/developers
2. Find your **Flaco Admin Dashboard** app
3. Click **"Edit"**
4. Update **Homepage URL:** `https://yourusername.github.io/flaco`
5. Keep the same **Callback URL** (Supabase handles this)
6. Click **"Update application"**

### D. Update Supabase URLs

1. Go to: https://embujgkwtuazdcmodqst.supabase.co
2. Navigate to **Authentication > URL Configuration**
3. Update **Site URL:** `https://yourusername.github.io/flaco`
4. Add **Redirect URLs:**
   ```
   https://yourusername.github.io/flaco/admin
   https://yourusername.github.io/flaco/admin/login
   ```
5. Click **"Save"**

### E. Enable GitHub Pages

1. Go to repository **Settings > Pages**
2. **Source:** Deploy from a branch
3. **Branch:** Select `gh-pages` (will be created on first deploy)
4. Click **"Save"**

### F. Deploy

1. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Add admin dashboard with Supabase integration"
   git push origin main
   ```

2. Watch deployment:
   - Go to **Actions** tab
   - Should see "Deploy to GitHub Pages" workflow running
   - Wait for ✅ completion (~2-3 minutes)

3. Visit production site:
   ```
   https://yourusername.github.io/flaco/admin/login
   ```

---

## 📊 What You Get

### Admin Dashboard Features

- **Authentication:**
  - GitHub OAuth login
  - Google OAuth (after configuring)
  - Magic link email login
  - Persistent sessions
  - Auto logout button

- **Analytics Dashboard:**
  - Total posts/projects/work items
  - Published vs draft counts
  - Top content tags
  - Monthly activity charts
  - Quick stats overview

- **Content Management:**
  - Posts table with search
  - Projects table with search
  - Status badges (published/draft)
  - Quick links to content
  - Tag display

- **Media Management:**
  - Drag-and-drop upload
  - Image previews
  - File validation (type + size)
  - Progress tracking
  - Gallery view with search
  - Copy URL to clipboard
  - Delete files
  - Metadata tracking

### Security Features

- **Row Level Security (RLS):**
  - Users can only delete their own uploads
  - All reads require authentication
  - Inserts tracked by user ID

- **Storage Policies:**
  - Public read access
  - Authenticated upload only
  - User-owned deletion only

- **Build-time Safety:**
  - Type checking in CI/CD
  - Test suite runs on PRs
  - Environment validation

---

## 🐛 Troubleshooting

### "Invalid API key" Error

**Cause:** Wrong anon key format

**Fix:**
1. Check `.env` file
2. Get correct key from Supabase dashboard (Settings > API)
3. Should start with `eyJ...`
4. Restart dev server

### OAuth Redirect Not Working

**Cause:** Redirect URL mismatch

**Fix:**
1. Verify callback URL in GitHub OAuth app
2. Check redirect URLs in Supabase dashboard
3. Clear browser cookies and try again

### Upload Fails: "403 Forbidden"

**Cause:** Storage policies not configured

**Fix:**
1. Verify bucket exists and is public
2. Run `supabase/storage-policies.sql`
3. Check user is authenticated (DevTools > Application > Storage)

### Upload Fails: "Row Level Security"

**Cause:** `uploaded_by` field mismatch

**Fix:**
1. Check RLS policies on `media_meta` table
2. Ensure policy uses `auth.uid() = uploaded_by`
3. Verify user is authenticated before upload

### Media Gallery Empty

**Cause:** No data or RLS blocking reads

**Fix:**
1. Verify `media_meta` table exists
2. Check RLS policy allows SELECT for authenticated users
3. Try uploading a file first

---

## 📁 File Structure

```
flaco/
├── .env                          # Supabase credentials (local only)
├── .github/
│   └── workflows/
│       ├── ci.yml               # PR checks (type + test)
│       └── deploy.yml           # Production deployment
├── supabase/
│   ├── database-schema.sql      # media_meta table + RLS
│   └── storage-policies.sql     # Storage bucket policies
├── src/
│   ├── components/admin/
│   │   ├── AuthProvider.tsx    # React context for auth
│   │   ├── AuthGuard.tsx       # Route protection
│   │   ├── MediaUpload.tsx     # Drag-and-drop upload
│   │   ├── MediaGallery.tsx    # Image gallery
│   │   ├── ContentTable.astro  # Searchable table
│   │   └── StatsCard.astro     # Stat widgets
│   ├── layouts/
│   │   └── AdminLayout.astro   # Admin sidebar layout
│   ├── pages/admin/
│   │   ├── login.astro         # OAuth login
│   │   ├── index.astro         # Dashboard
│   │   ├── analytics.astro     # Analytics
│   │   ├── posts.astro         # Posts table
│   │   ├── projects.astro      # Projects table
│   │   └── media.astro         # Media management
│   └── utils/admin/
│       ├── supabase.ts         # Client init (lazy)
│       ├── auth.ts             # Auth helpers
│       └── media.ts            # Media utilities
├── SUPABASE_SETUP.md           # Detailed setup (400+ lines)
└── QUICK_SETUP.md              # This file
```

---

## 🎯 Success Checklist

- [ ] GitHub OAuth app created
- [ ] Supabase GitHub provider enabled
- [ ] Database table `media_meta` created
- [ ] Storage bucket `media` created
- [ ] Storage policies configured
- [ ] Local login works (http://localhost:4322/admin/login)
- [ ] All admin pages load
- [ ] Media upload works
- [ ] GitHub secrets added
- [ ] Production OAuth updated
- [ ] Production deployed
- [ ] Production login works

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Astro Islands:** https://docs.astro.build/en/concepts/islands/
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security

---

**Setup complete! 🎉**

Your admin dashboard is production-ready with authentication, analytics, content management, and media uploads.
