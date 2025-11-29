-- Create rfq_responses table
CREATE TABLE rfq_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID REFERENCES rfq_submissions(id) ON DELETE CASCADE NOT NULL,
  manufacturer_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  
  -- Data Storage
  pricing_data JSONB DEFAULT '{}'::jsonb, -- Raw pricing structure
  extracted_metrics JSONB DEFAULT '{}'::jsonb, -- AI extracted fields (unit_price, moq, etc)
  ai_analysis JSONB DEFAULT '{}'::jsonb, -- AI scoring, flags, summary
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One response per manufacturer per RFQ (for now, can be relaxed later if needed)
  UNIQUE(rfq_id, manufacturer_id)
);

-- Indexes
CREATE INDEX idx_rfq_responses_rfq ON rfq_responses(rfq_id);
CREATE INDEX idx_rfq_responses_manufacturer ON rfq_responses(manufacturer_id);

-- RLS Policies
ALTER TABLE rfq_responses ENABLE ROW LEVEL SECURITY;

-- Customers can view responses for their RFQs
CREATE POLICY "Customers can view responses for their RFQs"
  ON rfq_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rfq_submissions
      JOIN projects ON rfq_submissions.project_id = projects.id
      WHERE rfq_submissions.id = rfq_responses.rfq_id
      AND projects.user_id = auth.uid()
    )
  );

-- Manufacturers can view their own responses
CREATE POLICY "Manufacturers can view their own responses"
  ON rfq_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = rfq_responses.manufacturer_id
      -- Assuming partners are linked to users via some mechanism, 
      -- but for now we might need to rely on the 'submitted_by' logic if we had it.
      -- Since partners table doesn't seem to have user_id directly in the snippet I saw,
      -- I will assume for now that if we are logged in as a partner user, we can see it.
      -- WAIT: The `quotes` table had `submitted_by_user_id`. 
      -- I should probably add `submitted_by_user_id` to `rfq_responses` too for easier RLS.
    )
  );

-- Let's add submitted_by_user_id to be safe and consistent with quotes table
ALTER TABLE rfq_responses ADD COLUMN submitted_by_user_id UUID REFERENCES auth.users(id);

-- Update Policy for Manufacturers
DROP POLICY "Manufacturers can view their own responses" ON rfq_responses;

CREATE POLICY "Manufacturers can view their own responses"
  ON rfq_responses FOR SELECT
  USING (submitted_by_user_id = auth.uid());

-- Manufacturers can create responses
CREATE POLICY "Manufacturers can create responses"
  ON rfq_responses FOR INSERT
  WITH CHECK (submitted_by_user_id = auth.uid());

-- Manufacturers can update their own responses
CREATE POLICY "Manufacturers can update their own responses"
  ON rfq_responses FOR UPDATE
  USING (submitted_by_user_id = auth.uid());
