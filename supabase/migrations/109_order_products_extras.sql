-- POLICIES
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert order_products" ON order_products;
CREATE POLICY "Anyone can insert order_products"
ON order_products
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admin can update order_products" ON order_products;
CREATE POLICY "Only admin can update order_products"
ON order_products
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Only admin can delete order_products" ON order_products;
CREATE POLICY "Only admin can delete order_products"
ON order_products
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Users can read their own order_products or admin" ON order_products;
CREATE POLICY "Users can read their own order_products or admin"
ON order_products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_products.order_id
      AND (
        orders.user_id = auth.uid()
        OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
      )
  )
);

-- Function to set price on order_products insert
CREATE OR REPLACE FUNCTION set_order_product_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price IS NULL THEN
        SELECT price INTO NEW.price FROM products WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_product_price ON order_products;
CREATE TRIGGER trg_set_order_product_price
BEFORE INSERT ON order_products
FOR EACH ROW
EXECUTE FUNCTION set_order_product_price();

-- Function to recalculate total_price
CREATE OR REPLACE FUNCTION recalc_order_total_stmt()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_price = (
        SELECT COALESCE(SUM(price * quantity), 0)
        FROM order_products
        WHERE order_products.order_id = orders.id
    )
    WHERE id IN (
        SELECT DISTINCT order_id FROM order_products
        WHERE order_id IS NOT NULL
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalc_order_total_insert ON order_products;
CREATE TRIGGER trg_recalc_order_total_insert
AFTER INSERT ON order_products
FOR EACH STATEMENT
EXECUTE FUNCTION recalc_order_total_stmt();

DROP TRIGGER IF EXISTS trg_recalc_order_total_update ON order_products;
CREATE TRIGGER trg_recalc_order_total_update
AFTER UPDATE ON order_products
FOR EACH STATEMENT
EXECUTE FUNCTION recalc_order_total_stmt();

DROP TRIGGER IF EXISTS trg_recalc_order_total_delete ON order_products;
CREATE TRIGGER trg_recalc_order_total_delete
AFTER DELETE ON order_products
FOR EACH STATEMENT
EXECUTE FUNCTION recalc_order_total_stmt();
