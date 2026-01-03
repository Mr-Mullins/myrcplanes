-- ============================================
-- MY RC PLANES - INITIAL DATABASE SCHEMA
-- ============================================

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. RC PLANES TABLE
-- ============================================

CREATE TABLE rc_planes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  
  -- Aerodynamic measurements (in cm)
  vingespenn DECIMAL,
  rot_korde DECIMAL,
  tipp_korde DECIMAL,
  sweep DECIMAL DEFAULT 0,
  hale_areal DECIMAL,
  avstand_vinge_hale DECIMAL,
  
  -- Calculated values (stored for reference)
  vinge_areal DECIMAL,
  mac DECIMAL,
  cg_fremre DECIMAL,
  cg_bakre DECIMAL,
  
  -- Additional info
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies for rc_planes
ALTER TABLE rc_planes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own planes"
  ON rc_planes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planes"
  ON rc_planes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planes"
  ON rc_planes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own planes"
  ON rc_planes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. PLANE IMAGES TABLE
-- ============================================

CREATE TABLE plane_images (
  id BIGSERIAL PRIMARY KEY,
  plane_id BIGINT NOT NULL REFERENCES rc_planes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_thumbnail BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies for plane_images
ALTER TABLE plane_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view images of own planes"
  ON plane_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rc_planes 
      WHERE rc_planes.id = plane_images.plane_id 
      AND rc_planes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images for own planes"
  ON plane_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rc_planes 
      WHERE rc_planes.id = plane_images.plane_id 
      AND rc_planes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images of own planes"
  ON plane_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rc_planes 
      WHERE rc_planes.id = plane_images.plane_id 
      AND rc_planes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images of own planes"
  ON plane_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rc_planes 
      WHERE rc_planes.id = plane_images.plane_id 
      AND rc_planes.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. CONSTRAINTS
-- ============================================

-- Maximum 5 images per plane
CREATE OR REPLACE FUNCTION check_max_images_per_plane()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM plane_images WHERE plane_id = NEW.plane_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 images per plane allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_images
  BEFORE INSERT ON plane_images
  FOR EACH ROW
  EXECUTE FUNCTION check_max_images_per_plane();

-- Only one thumbnail per plane
CREATE OR REPLACE FUNCTION ensure_single_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_thumbnail = true THEN
    UPDATE plane_images 
    SET is_thumbnail = false 
    WHERE plane_id = NEW.plane_id 
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_thumbnail
  AFTER INSERT OR UPDATE ON plane_images
  FOR EACH ROW
  WHEN (NEW.is_thumbnail = true)
  EXECUTE FUNCTION ensure_single_thumbnail();

-- ============================================
-- 5. TRIGGERS FOR AUTO-PROFILE CREATION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_rc_planes_user_id ON rc_planes(user_id);
CREATE INDEX idx_plane_images_plane_id ON plane_images(plane_id);
CREATE INDEX idx_plane_images_thumbnail ON plane_images(plane_id, is_thumbnail) WHERE is_thumbnail = true;






