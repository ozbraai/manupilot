-- Create quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID REFERENCES rfq_submissions(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  total_price DECIMAL(10,2),
  
  -- Timeline
  lead_time_days INTEGER NOT NULL,
  production_capacity INTEGER,
  
  -- Terms
  moq INTEGER NOT NULL,
  payment_terms TEXT,
  shipping_terms TEXT,
  
  -- Additional Info
  notes TEXT,
  validity_days INTEGER DEFAULT 30,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One quote per partner per RFQ
  UNIQUE(rfq_id, partner_id)
);

-- Indexes
CREATE INDEX idx_quotes_rfq ON quotes(rfq_id);
CREATE INDEX idx_quotes_partner ON quotes(partner_id);
CREATE INDEX idx_quotes_status ON quotes(rfq_id, status);

-- RLS Policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Customers can see quotes for their RFQs
CREATE POLICY "Customers can view quotes for their RFQs"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rfq_submissions
      JOIN projects ON rfq_submissions.project_id = projects.id
      WHERE rfq_submissions.id = quotes.rfq_id
      AND projects.user_id = auth.uid()
    )
  );

-- Partners can view their own quotes
CREATE POLICY "Partners can view their own quotes"
  ON quotes FOR SELECT
  USING (submitted_by_user_id = auth.uid());

-- Partners can create quotes
CREATE POLICY "Partners can create quotes"
  ON quotes FOR INSERT
  WITH CHECK (submitted_by_user_id = auth.uid());

-- Partners can update their own quotes (only if pending)
CREATE POLICY "Partners can update their own quotes"
  ON quotes FOR UPDATE
  USING (submitted_by_user_id = auth.uid() AND status = 'pending');

-- Customers can update quote status (accept/reject)
CREATE POLICY "Customers can update quote status"
  ON quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rfq_submissions
      JOIN projects ON rfq_submissions.project_id = projects.id
      WHERE rfq_submissions.id = quotes.rfq_id
      AND projects.user_id = auth.uid()
    )
  );
