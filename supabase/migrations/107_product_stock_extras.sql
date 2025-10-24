-- POLICIES
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can insert product_stock" ON product_stock;
CREATE POLICY "Only admins can insert product_stock"
ON product_stock
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users and admins can select product_stock" ON product_stock;
CREATE POLICY "Users and admins can select product_stock"
ON product_stock
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('user', 'admin')
  )
);

DROP POLICY IF EXISTS "Only admins can update product_stock" ON product_stock;
CREATE POLICY "Only admins can update product_stock"
ON product_stock
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Only admins can delete product_stock" ON product_stock;
CREATE POLICY "Only admins can delete product_stock"
ON product_stock
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
  )
);
