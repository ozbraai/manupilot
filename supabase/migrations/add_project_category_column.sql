-- Add category column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add comment
COMMENT ON COLUMN projects.category IS 'Product category (e.g., "Outdoor & Camping", "Kitchen & Cooking")';

-- Optionally update existing projects to read category from localStorage
-- This will be done client-side when users next visit their dashboard
