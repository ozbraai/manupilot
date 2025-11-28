-- Add feasibility column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS feasibility JSONB;

-- Add comment
COMMENT ON COLUMN projects.feasibility IS 'Computed feasibility scores from FeasibilityFeatures (JSON structure from lib/feasibility.ts)';
