-- Enable RLS on partners table (ensure it is enabled)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own partner profile
DROP POLICY IF EXISTS "Users can create their own partner profile" ON partners;
CREATE POLICY "Users can create their own partner profile"
ON partners FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own partner profile
DROP POLICY IF EXISTS "Users can update their own partner profile" ON partners;
CREATE POLICY "Users can update their own partner profile"
ON partners FOR UPDATE
USING (auth.uid() = user_id);

-- Allow everyone to view partners (ensure this exists for marketplace)
DROP POLICY IF EXISTS "Partners are viewable by everyone" ON partners;
CREATE POLICY "Partners are viewable by everyone"
ON partners FOR SELECT
USING (true);
