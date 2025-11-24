-- Enable RLS on rfq_submissions (ensure it's enabled)
ALTER TABLE rfq_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view submitted RFQs (Marketplace)
CREATE POLICY "Anyone can view submitted RFQs"
ON rfq_submissions FOR SELECT
USING (status = 'submitted');

-- Policy: Users can view their own draft/completed RFQs
CREATE POLICY "Users can view own RFQs"
ON rfq_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = rfq_submissions.project_id
    AND projects.user_id = auth.uid()
  )
);
