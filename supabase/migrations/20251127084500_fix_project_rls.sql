-- Enable RLS on projects (ensure it's enabled)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 1. VIEW: Users can view their own projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- 2. INSERT: Users can create their own projects
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
CREATE POLICY "Users can create own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can update their own projects
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- 4. DELETE: Users can delete their own projects
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- 5. PUBLIC VIEW: Allow public to view projects with submitted RFQs (Marketplace)
-- (Re-applying to ensure it exists)
DROP POLICY IF EXISTS "Public can view projects with submitted RFQs" ON projects;
CREATE POLICY "Public can view projects with submitted RFQs"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rfq_submissions
    WHERE rfq_submissions.project_id = projects.id
    AND rfq_submissions.status = 'submitted'
  )
);
