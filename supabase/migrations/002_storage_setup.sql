-- ============================================
-- STORAGE SETUP FOR PLANE IMAGES
-- ============================================

-- Create storage bucket for plane images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plane-images', 'plane-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload plane images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'plane-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view all public images
CREATE POLICY "Anyone can view plane images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'plane-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own plane images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'plane-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own plane images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'plane-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

