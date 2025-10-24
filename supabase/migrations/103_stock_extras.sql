-- POLICIES
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can insert stock" ON stock;
CREATE POLICY "Only admins can insert stock"
ON stock
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Only admins can select stock" ON stock;
CREATE POLICY "Only admins can select stock"
ON stock
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Only admins can update stock" ON stock;
CREATE POLICY "Only admins can update stock"
ON stock
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Only admins can delete stock" ON stock;
CREATE POLICY "Only admins can delete stock"
ON stock
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- Subtract stock when order is placed
CREATE OR REPLACE FUNCTION subtract_stock_on_order_product_insert()
RETURNS TRIGGER AS $$
DECLARE
    ps_rec RECORD;
    current_stock_qty NUMERIC;
    required_qty NUMERIC;
BEGIN
    -- For each stock item used by the product
    FOR ps_rec IN
        SELECT stock_id, quantity AS per_unit_usage
        FROM product_stock
        WHERE product_id = NEW.product_id
    LOOP
        -- Get current stock quantity
        SELECT quantity INTO current_stock_qty FROM stock WHERE id = ps_rec.stock_id;
        required_qty := ps_rec.per_unit_usage * NEW.quantity;
        
        -- Check availability and raise exception with SQLSTATE to abort entire transaction
        IF current_stock_qty < required_qty THEN
            RAISE EXCEPTION 'Not enough stock for item %'
                USING DETAIL = ps_rec.stock_id,
                      HINT = 'Insufficient stock will abort the entire order transaction',
                      ERRCODE = 'P0001';  -- Custom error code for insufficient stock
        END IF;
        
        -- Subtract from stock
        UPDATE stock
        SET quantity = quantity - required_qty
        WHERE id = ps_rec.stock_id;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- DISABLED: Stock deduction trigger (replaced by atomic create_order_atomic function)
-- The atomic function handles stock checking and deduction in a single transaction
-- DROP TRIGGER IF EXISTS trg_subtract_stock_on_order_product_insert ON order_products;
-- CREATE TRIGGER trg_subtract_stock_on_order_product_insert
-- AFTER INSERT ON order_products
-- FOR EACH ROW
-- EXECUTE FUNCTION subtract_stock_on_order_product_insert();

-- DISABLED: Stock refund trigger (replaced by migration 206_order_cancellation_refund.sql)
-- The new migration provides the same functionality with better audit logging
-- 
-- CREATE OR REPLACE FUNCTION add_stock_on_order_cancelled()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     op_rec RECORD;
--     ps_rec RECORD;
-- BEGIN
--     -- Only act if status changed to 'cancelled'
--     IF (NEW.status = 'cancelled') AND (OLD.status IS DISTINCT FROM NEW.status) THEN
--         -- For each product in the order
--         FOR op_rec IN
--             SELECT product_id, quantity
--             FROM order_products
--             WHERE order_id = NEW.id
--         LOOP
--             -- For each stock item used by the product
--             FOR ps_rec IN
--                 SELECT stock_id, quantity AS per_unit_usage
--                 FROM product_stock
--                 WHERE product_id = op_rec.product_id
--             LOOP
--                 -- Add back to stock
--                 UPDATE stock
--                 SET quantity = quantity + (ps_rec.per_unit_usage * op_rec.quantity)
--                 WHERE id = ps_rec.stock_id;
--             END LOOP;
--         END LOOP;
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql
-- SECURITY DEFINER;
-- 
-- DROP TRIGGER IF EXISTS trg_add_stock_on_order_cancelled ON orders;
-- CREATE TRIGGER trg_add_stock_on_order_cancelled
-- AFTER UPDATE OF status ON orders
-- FOR EACH ROW
-- EXECUTE FUNCTION add_stock_on_order_cancelled();
