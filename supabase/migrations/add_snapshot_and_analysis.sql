-- Extend projects table with new columns for snapshot and AI analysis

-- Add playbook_snapshot column (stores frozen playbook state)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS playbook_snapshot JSONB;

-- Add ai_analysis column (stores deep manufacturing intelligence)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_snapshot_date 
ON projects ((playbook_snapshot->>'snapshot_date'));

CREATE INDEX IF NOT EXISTS idx_projects_category 
ON projects ((playbook_snapshot->>'category'));

-- Optional: Create playbooks table for draft persistence before project creation
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data JSONB NOT NULL,
  user_overrides JSONB DEFAULT '{}'::jsonb,
  wizard_input JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON playbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_updated_at ON playbooks(updated_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for playbooks table
CREATE TRIGGER update_playbooks_updated_at 
BEFORE UPDATE ON playbooks 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON COLUMN projects.playbook_snapshot IS 'Frozen snapshot of the playbook when project was created';
COMMENT ON COLUMN projects.ai_analysis IS 'Deep AI-generated manufacturing intelligence including BOM, certifications, supply chain, etc';
COMMENT ON TABLE playbooks IS 'Draft playbooks before conversion to projects';
