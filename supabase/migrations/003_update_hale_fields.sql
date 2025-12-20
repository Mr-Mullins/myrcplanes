-- ============================================
-- UPDATE HALE FIELDS - Replace hale_areal with separate measurements
-- ============================================

-- Add new columns for hale measurements
ALTER TABLE rc_planes 
  ADD COLUMN IF NOT EXISTS hale_spenn DECIMAL,
  ADD COLUMN IF NOT EXISTS hale_rot_korde DECIMAL,
  ADD COLUMN IF NOT EXISTS hale_tipp_korde DECIMAL;

-- Note: We keep hale_areal as it's now a calculated value that will be stored
-- If you want to remove the old column after migration, uncomment the line below:
-- ALTER TABLE rc_planes DROP COLUMN IF EXISTS hale_areal;

-- Update existing data: If someone had entered hale_areal manually before,
-- we can't reverse-engineer the dimensions, so we leave those rows as-is.
-- New entries will use the new fields.

COMMENT ON COLUMN rc_planes.hale_spenn IS 'Halens vingespenn i cm';
COMMENT ON COLUMN rc_planes.hale_rot_korde IS 'Halens rotkorde i cm';
COMMENT ON COLUMN rc_planes.hale_tipp_korde IS 'Halens tippkorde i cm (valgfri, bruker rotkorde hvis null)';
COMMENT ON COLUMN rc_planes.hale_areal IS 'Beregnet haleareal i cm² (calculated value)';


