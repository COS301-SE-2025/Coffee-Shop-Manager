-- POLICIES
ALTER TABLE stock_take ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin insert stock_take" ON stock_take;
CREATE POLICY "Admin insert stock_take"
ON stock_take
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Admin select stock_take" ON stock_take;
CREATE POLICY "Admin select stock_take"
ON stock_take
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Admin update stock_take" ON stock_take;
CREATE POLICY "Admin update stock_take"
ON stock_take
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Admin delete stock_take" ON stock_take;
CREATE POLICY "Admin delete stock_take"
ON stock_take
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- Allow only one active stock take at a time
CREATE UNIQUE INDEX IF NOT EXISTS one_active_stock_take
ON stock_take(status)
WHERE status = 'inprogress';
