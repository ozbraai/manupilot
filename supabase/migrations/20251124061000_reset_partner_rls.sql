-- "Nuclear Option" to fix RLS on partners table
-- This script drops ALL existing policies on the partners table to ensure no conflicts exist.

DO $$ 
DECLARE 
    pol record; 
BEGIN 
    -- Loop through all policies on the partners table and drop them
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'partners' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON partners', pol.policyname); 
    END LOOP; 
END $$;

-- Enable RLS (just in case)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- 1. Allow users to INSERT their own profile
CREATE POLICY "Users can create their own partner profile"
ON partners FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own partner profile"
ON partners FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Allow everyone to VIEW all partners
CREATE POLICY "Partners are viewable by everyone"
ON partners FOR SELECT
USING (true);

-- 4. Allow users to DELETE their own profile (optional but good practice)
CREATE POLICY "Users can delete their own partner profile"
ON partners FOR DELETE
USING (auth.uid() = user_id);
