# Supabase Setup Guide

Complete guide to configure Supabase for the Flaco Admin Dashboard.

## Prerequisites

- Flaco project repository
- GitHub account (for OAuth)
- Google account (optional, for OAuth)

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** `flaco-admin` (or your preference)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (upgrade to Pro for production)
4. Click **"Create new project"**
5. Wait ~2 minutes for project provisioning

---

## Step 2: Get API Credentials

1. In Supabase Dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL:** `https://xxx.supabase.co`
   - **anon public key:** `eyJxxx...`
3. Create `.env` file in project root:
   ```env
   PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
   ```
4. **Important:** `.env` is already in `.gitignore` - never commit credentials!

---

## Step 3: Configure Authentication

### Enable Email/Password Auth

1. Go to **Authentication > Providers**
2. Ensure **Email** is enabled (default)
3. Configure email templates (optional):
   - Go to **Authentication > Email Templates**
   - Customize "Confirm signup" and "Magic Link" templates

### Enable GitHub OAuth

1. Create GitHub OAuth App:
   - Go to https://github.com/settings/developers
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `Flaco Admin`
     - **Homepage URL:** `https://yourdomain.com` (or localhost for testing)
     - **Authorization callback URL:** `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Click **"Register application"**
   - Copy **Client ID** and **Client Secret**

2. Configure in Supabase:
   - Go to **Authentication > Providers**
   - Find **GitHub** and click **Enable**
   - Paste **Client ID** and **Client Secret**
   - Click **Save**

### Enable Google OAuth (Optional)

1. Create Google OAuth credentials:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create project if needed
   - Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
   - Configure consent screen first (required)
   - Application type: **Web application**
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**

2. Configure in Supabase:
   - Go to **Authentication > Providers**
   - Find **Google** and click **Enable**
   - Paste **Client ID** and **Client Secret**
   - Click **Save**

### Configure Redirect URLs

1. Go to **Authentication > URL Configuration**
2. Add your site URLs:
   - **Site URL:** `https://yourdomain.com` (production)
   - **Redirect URLs:** Add these URLs:
     - `http://localhost:4321/admin` (local development)
     - `https://yourdomain.com/admin` (production)
     - `https://your-github-username.github.io/admin` (GitHub Pages)

---

## Step 4: Create Database Tables

### media_meta Table

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Paste the following SQL:

```sql
-- Create media_meta table
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

-- Create indexes for performance
CREATE INDEX idx_media_uploaded_at ON media_meta(uploaded_at DESC);
CREATE INDEX idx_media_uploaded_by ON media_meta(uploaded_by);
CREATE INDEX idx_media_tags ON media_meta USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE media_meta ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view media"
  ON media_meta FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload media"
  ON media_meta FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

CREATE POLICY "Users can update own media"
  ON media_meta FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own media"
  ON media_meta FOR DELETE
  USING (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);
```

4. Click **"Run"**
5. Verify table created: **Database > Tables** should show `media_meta`

---

## Step 5: Configure Storage

### Create Storage Bucket

1. Go to **Storage**
2. Click **"Create a new bucket"**
3. Fill in:
   - **Name:** `media`
   - **Public bucket:** ✅ **Enabled** (for CDN delivery)
   - **File size limit:** 10 MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif, image/svg+xml`
4. Click **"Create bucket"**

### Configure Storage Policies

1. Click on the `media` bucket
2. Go to **Policies** tab
3. Create policies:

**Policy 1: Allow authenticated uploads**
```sql
-- INSERT Policy
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.role() = 'authenticated'
);
```

**Policy 2: Allow public reads**
```sql
-- SELECT Policy
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');
```

**Policy 3: Allow users to delete own files**
```sql
-- DELETE Policy
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  auth.role() = 'authenticated' AND
  auth.uid() = owner
);
```

---

## Step 6: Test Configuration

### Test Authentication

1. Start dev server: `npm run dev`
2. Go to `http://localhost:4321/admin/login`
3. Try logging in with:
   - GitHub OAuth (redirects to GitHub)
   - Google OAuth (redirects to Google)
   - Magic link (sends email)
4. After login, should redirect to `/admin` dashboard

### Test Media Upload

1. Go to `http://localhost:4321/admin/media`
2. Upload a test image
3. Verify:
   - Upload progress shows
   - File appears in gallery
   - Can copy URL
   - Can delete file
4. Check Supabase:
   - **Storage > media** should show uploaded file
   - **Database > media_meta** should have metadata row

---

## Step 7: Production Deployment

### Update GitHub Secrets

1. Go to repository **Settings > Secrets > Actions**
2. Add secrets:
   - `SUPABASE_URL` = Your Project URL
   - `SUPABASE_ANON_KEY` = Your anon public key

### Update Deploy Workflow

The deploy workflow (`.github/workflows/deploy.yml`) should include:

```yaml
- name: Build with environment variables
  env:
    PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  run: npm run build
```

### Update Supabase Redirect URLs

1. Go to **Authentication > URL Configuration**
2. Add production URLs:
   - **Site URL:** `https://yourdomain.com`
   - **Redirect URLs:** `https://yourdomain.com/admin`

---

## Troubleshooting

### "Invalid API key" Error

**Cause:** Environment variables not set or incorrect

**Fix:**
1. Check `.env` file exists in project root
2. Verify `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are correct
3. Restart dev server after changing `.env`

### OAuth Redirect Not Working

**Cause:** Redirect URL not configured in provider or Supabase

**Fix:**
1. Check OAuth app redirect URL matches Supabase callback
2. Add redirect URLs in Supabase dashboard
3. Clear browser cookies and try again

### Upload Fails: "403 Forbidden"

**Cause:** Storage policies not configured correctly

**Fix:**
1. Verify storage policies exist and are enabled
2. Check bucket is public
3. Ensure user is authenticated (check session in browser DevTools)

### Upload Fails: "Row Level Security"

**Cause:** `uploaded_by` field not matching authenticated user

**Fix:**
1. Check RLS policies on `media_meta` table
2. Ensure policy uses `auth.uid() = uploaded_by`
3. Verify user is authenticated before upload

### Media Gallery Empty

**Cause:** Table doesn't exist or has no data

**Fix:**
1. Verify `media_meta` table exists in **Database > Tables**
2. Check RLS policy allows SELECT for authenticated users
3. Try uploading a file first

---

## Cost Estimation

### Free Tier Limits
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB
- MAU: 50,000

### Pro Plan ($25/month)
- Database: 8 GB
- Storage: 100 GB
- Bandwidth: 200 GB
- MAU: 100,000

### When to Upgrade
- **Storage:** 1GB = ~1,000 high-res images
- **Bandwidth:** 2GB/month = ~20,000 image views
- **MAU:** Free tier sufficient for most personal blogs

---

## Security Best Practices

1. **Never commit .env file** - Already in `.gitignore`
2. **Use Row Level Security** - All tables have RLS enabled
3. **Validate uploads client-side** - File size and type checks
4. **Set file size limits** - Bucket configured for 10MB max
5. **Use HTTPS only** - Supabase enforces HTTPS
6. **Rotate keys periodically** - Generate new API keys every 6 months
7. **Monitor usage** - Check Supabase dashboard for unusual activity

---

## Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **Authentication Guide:** https://supabase.com/docs/guides/auth
- **Storage Guide:** https://supabase.com/docs/guides/storage
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **GitHub OAuth Setup:** https://docs.github.com/en/developers/apps/building-oauth-apps

---

## Quick Reference

### Environment Variables
```env
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### Bucket Name
```
media
```

### Table Name
```
media_meta
```

### Storage Path Pattern
```
{timestamp}-{random}.{extension}
Example: 1234567890-abc123.jpg
```

---

**Setup Complete!** 🎉

Your Flaco admin dashboard is now configured with Supabase authentication and media management.
