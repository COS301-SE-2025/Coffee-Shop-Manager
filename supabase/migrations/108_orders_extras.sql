-- POLICIES
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create order" ON orders;
CREATE POLICY "Anyone can create order"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Only admin can update order" ON orders;
CREATE POLICY "Only admin can update order"
ON orders
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Only admin can delete order" ON orders;
CREATE POLICY "Only admin can delete order"
ON orders
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Users can select own or admin can select all" ON orders;
CREATE POLICY "Users can select own or admin can select all"
ON orders
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

alter publication supabase_realtime add table public.orders;

-- Update updated_at if updated
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.status IS DISTINCT FROM OLD.status THEN
		NEW.updated_at = NOW();
  	END IF;
  	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_order_updated_at ON orders;
CREATE TRIGGER trg_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Update stats on user_profiles
CREATE OR REPLACE FUNCTION update_user_profile_on_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_total_orders INTEGER;
    v_total_spent NUMERIC;
    v_fav_product_id UUID;
BEGIN
    v_user_id := NEW.user_id;

    -- Recalculate total_orders and total_spent for all completed orders
    SELECT COUNT(*), COALESCE(SUM(order_total), 0)
    INTO v_total_orders, v_total_spent
    FROM (
        SELECT o.id, SUM(op.quantity * p.price) AS order_total
        FROM orders o
        JOIN order_products op ON op.order_id = o.id
        JOIN products p ON p.id = op.product_id
        WHERE o.user_id = v_user_id AND o.status = 'completed'
        GROUP BY o.id
    ) sub;

    -- Find favourite product (most ordered across all completed orders)
    SELECT op.product_id
    INTO v_fav_product_id
    FROM order_products op
    JOIN orders o ON o.id = op.order_id
    WHERE o.user_id = v_user_id AND o.status = 'completed'
    GROUP BY op.product_id
    ORDER BY SUM(op.quantity) DESC
    LIMIT 1;

    -- Update user_profiles
    UPDATE user_profiles
    SET
        total_orders = COALESCE(v_total_orders, 0),
        total_spent = COALESCE(v_total_spent, 0),
        favourite_product_id = v_fav_product_id
    WHERE user_id = v_user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_profile_on_order_status_change ON orders;
CREATE TRIGGER trg_update_user_profile_on_order_status_change
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION update_user_profile_on_order_status_change();

-- Function to insert into stock_adjustments when order is completed
CREATE OR REPLACE FUNCTION insert_stock_adjustments_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    -- For each product in the order, and for each stock item that product uses,
    -- insert a stock adjustment for the total quantity used.
    INSERT INTO stock_adjustments (
      stock_id,
      adjustment_qty,
      reference,
      reference_type,
      reference_id,
      created_at
    )
    SELECT
      ps.stock_id,
      -1 * op.quantity * ps.quantity, -- negative: stock is reduced
      'Order completed',
      'order',
      NEW.id,
      NOW()
    FROM order_products op
    JOIN product_stock ps ON op.product_id = ps.product_id
    WHERE op.order_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_insert_stock_adjustments_on_order_complete ON orders;
CREATE TRIGGER trg_insert_stock_adjustments_on_order_complete
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION insert_stock_adjustments_on_order_complete();