-- =====================================================
-- Flaco Admin Dashboard - Storage Policies
-- =====================================================
-- IMPORTANT: Create the 'media' bucket FIRST via UI before running this!
-- Dashboard: https://embujgkwtuazdcmodqst.supabase.co
-- Path: Storage > Create bucket > Name: "media" > Public: YES
-- =====================================================

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  auth.role() = 'authenticated'
);

-- Policy 2: Allow public read access
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy 3: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify policies created
SELECT 'Storage policies created successfully!' as status;
