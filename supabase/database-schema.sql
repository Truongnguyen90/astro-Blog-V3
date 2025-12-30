-- =====================================================
-- Flaco Admin Dashboard - Database Schema
-- =====================================================
-- Run this script in Supabase SQL Editor
-- Dashboard: https://embujgkwtuazdcmodqst.supabase.co
-- Path: SQL Editor > New Query > Paste & Run
-- =====================================================

-- Create media_meta table
CREATE TABLE IF NOT EXISTS media_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  alt_text TEXT,
  tags TEXT[],
  CONSTRAINT valid_size CHECK (size > 0 AND size < 10485760) -- 10MB limit
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media_meta(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media_meta(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media_meta USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE media_meta ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Authenticated users can view media" ON media_meta;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON media_meta;
DROP POLICY IF EXISTS "Users can update own media" ON media_meta;
DROP POLICY IF EXISTS "Users can delete own media" ON media_meta;

-- RLS Policy: View media
CREATE POLICY "Authenticated users can view media"
  ON media_meta FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policy: Upload media
CREATE POLICY "Authenticated users can upload media"
  ON media_meta FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

-- RLS Policy: Update own media
CREATE POLICY "Users can update own media"
  ON media_meta FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

-- RLS Policy: Delete own media
CREATE POLICY "Users can delete own media"
  ON media_meta FOR DELETE
  USING (auth.role() = 'authenticated' AND auth.uid() = uploaded_by);

-- Verify table created
SELECT 'media_meta table created successfully!' as status;
SELECT * FROM media_meta LIMIT 1;
