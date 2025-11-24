-- Add new columns to the partners table
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS certificates jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS industry text;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_industry ON partners(industry);
CREATE INDEX IF NOT EXISTS idx_partners_is_featured ON partners(is_featured);

-- Comment on columns
COMMENT ON COLUMN partners.status IS 'Verification status: pending, verified, rejected';
COMMENT ON COLUMN partners.notes IS 'Internal admin notes';
COMMENT ON COLUMN partners.is_featured IS 'Whether the supplier is featured in the marketplace';
