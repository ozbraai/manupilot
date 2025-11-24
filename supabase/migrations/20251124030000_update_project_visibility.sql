-- Enable RLS on projects (ensure it's enabled)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view projects that have a submitted RFQ
-- This is required for the Marketplace to show project titles/descriptions
CREATE POLICY "Public can view projects with submitted RFQs"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rfq_submissions
    WHERE rfq_submissions.project_id = projects.id
    AND rfq_submissions.status = 'submitted'
  )
);
