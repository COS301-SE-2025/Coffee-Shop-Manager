-- POLICIES
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can select own payments or admin" ON payments;
CREATE POLICY "User can select own payments or admin"
ON payments
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Users can isnert their own payments or admin" ON payments;
CREATE POLICY "Users can isnert their own payments or admin"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- Create payment when order is created
CREATE OR REPLACE FUNCTION create_payment_on_order_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO payments (
        order_id,
        user_id,
        method,
        amount,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.user_id,
        'cash',
        NEW.total_price,
        'pending',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_payment_on_order_insert ON orders;
CREATE TRIGGER trg_create_payment_on_order_insert
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION create_payment_on_order_insert();