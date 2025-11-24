-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_reviews_partner ON reviews(partner_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update partner rating when reviews change
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE partners
  SET rating = (
    SELECT AVG(rating)::numeric(3,2)
    FROM reviews
    WHERE partner_id = COALESCE(NEW.partner_id, OLD.partner_id)
  )
  WHERE id = COALESCE(NEW.partner_id, OLD.partner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update partner rating
CREATE TRIGGER trigger_update_partner_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_rating();
