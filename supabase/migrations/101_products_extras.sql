-- POLICIES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only Admins can create products" ON products;
CREATE POLICY "Only Admins can create products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Anyone can select products" ON products;
CREATE POLICY "Anyone can select products"
ON products
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Only Admins can update products" ON products;
CREATE POLICY "Only Admins can update products"
ON products
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Only Admins can delete products" ON products;
CREATE POLICY "Only Admins can delete products"
ON products
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- Function to get available product quantities
CREATE OR REPLACE FUNCTION get_product_availability(p_product_id UUID DEFAULT NULL)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    max_available INTEGER,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        FLOOR(MIN(stock.quantity / ps.quantity))::INTEGER AS max_available,
        (MIN(stock.quantity / ps.quantity) >= 1) AS is_available
    FROM products p
    JOIN product_stock ps ON ps.product_id = p.id
    JOIN stock ON stock.id = ps.stock_id
    WHERE (p_product_id IS NULL OR p.id = p_product_id)
    GROUP BY p.id, p.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to ensure every product is linked to a stock item
-- CREATE OR REPLACE FUNCTION ensure_product_stock_link()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     v_stock_id UUID;
-- BEGIN
--     -- Try to find a stock item with the same name
--     SELECT id INTO v_stock_id FROM stock WHERE item = NEW.name LIMIT 1;

--     -- If not found, create it
--     IF v_stock_id IS NULL THEN
--         INSERT INTO stock (item, quantity, unit_type, max_capacity)
--         VALUES (NEW.name, 0, 'unit', NULL)
--         RETURNING id INTO v_stock_id;
--     END IF;

--     -- Link product to its stock item if not already linked
--     IF NOT EXISTS (
--         SELECT 1 FROM product_stock WHERE product_id = NEW.id AND stock_id = v_stock_id
--     ) THEN
--         INSERT INTO product_stock (product_id, stock_id, quantity)
--         VALUES (NEW.id, v_stock_id, 1);
--     END IF;

--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- DROP TRIGGER IF EXISTS trg_ensure_product_stock_link ON products;
-- CREATE TRIGGER trg_ensure_product_stock_link
-- AFTER INSERT ON products
-- FOR EACH ROW
-- EXECUTE FUNCTION ensure_product_stock_link();
