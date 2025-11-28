-- Fix infinite recursion by using a SECURITY DEFINER function to check project ownership
-- This bypasses RLS on the projects table when checking permissions for rfq_submissions

-- 1. Create a helper function to check project ownership without triggering RLS
CREATE OR REPLACE FUNCTION is_project_owner(project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_id
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Update rfq_submissions policy to use the function
DROP POLICY IF EXISTS "Users can view own RFQs" ON rfq_submissions;

CREATE POLICY "Users can view own RFQs"
ON rfq_submissions FOR SELECT
USING (
  is_project_owner(project_id)
);

-- 3. Update quotes policies to use the function (prevent potential future recursion)
DROP POLICY IF EXISTS "Customers can view quotes for their RFQs" ON quotes;

CREATE POLICY "Customers can view quotes for their RFQs"
ON quotes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rfq_submissions
    WHERE rfq_submissions.id = quotes.rfq_id
    AND is_project_owner(rfq_submissions.project_id)
  )
);

DROP POLICY IF EXISTS "Customers can update quote status" ON quotes;

CREATE POLICY "Customers can update quote status"
ON quotes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM rfq_submissions
    WHERE rfq_submissions.id = quotes.rfq_id
    AND is_project_owner(rfq_submissions.project_id)
  )
);
