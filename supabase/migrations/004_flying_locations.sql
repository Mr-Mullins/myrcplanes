-- ============================================
-- FLYING LOCATIONS TABLE
-- Stores user's favorite flying locations for drones/RC planes
-- ============================================

CREATE TABLE flying_locations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Location details
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- Safety check cache (last check result)
  last_checked_at TIMESTAMP WITH TIME ZONE,
  last_status TEXT CHECK (last_status IN ('GRØNN', 'RØD')),
  nearest_airport_name TEXT,
  nearest_airport_distance DECIMAL(8, 2),
  in_nature_reserve BOOLEAN DEFAULT false,
  nature_reserve_name TEXT,

  -- Additional notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT norway_bounds CHECK (
    latitude >= 57 AND latitude <= 72 AND
    longitude >= 4 AND longitude <= 32
  )
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE flying_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own locations"
  ON flying_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own locations"
  ON flying_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations"
  ON flying_locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations"
  ON flying_locations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_flying_locations_user_id ON flying_locations(user_id);
CREATE INDEX idx_flying_locations_coordinates ON flying_locations(latitude, longitude);
CREATE INDEX idx_flying_locations_created_at ON flying_locations(created_at DESC);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_flying_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_flying_locations_updated_at
  BEFORE UPDATE ON flying_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_flying_locations_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE flying_locations IS 'Stores user favorite flying locations for drones and RC planes with safety check results';
COMMENT ON COLUMN flying_locations.last_status IS 'Cached safety status: GRØNN (safe with disclaimer) or RØD (unsafe)';
COMMENT ON COLUMN flying_locations.nearest_airport_distance IS 'Distance to nearest airport in kilometers';
