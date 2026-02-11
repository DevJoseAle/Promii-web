-- RLS Policies for promii_purchases table

-- Enable RLS on the table (if not already enabled)
ALTER TABLE promii_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own purchases" ON promii_purchases;
DROP POLICY IF EXISTS "Users can view their own purchases" ON promii_purchases;
DROP POLICY IF EXISTS "Merchants can view their purchases" ON promii_purchases;
DROP POLICY IF EXISTS "Merchants can update their purchases" ON promii_purchases;

-- 1. Allow users to create their own purchases
CREATE POLICY "Users can create their own purchases"
ON promii_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view their own purchases
CREATE POLICY "Users can view their own purchases"
ON promii_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Allow merchants to view purchases for their promiis
CREATE POLICY "Merchants can view their purchases"
ON promii_purchases
FOR SELECT
USING (
  auth.uid() = merchant_id
);

-- 4. Allow merchants to update purchases for their promiis (approve/reject)
CREATE POLICY "Merchants can update their purchases"
ON promii_purchases
FOR UPDATE
USING (auth.uid() = merchant_id)
WITH CHECK (auth.uid() = merchant_id);
