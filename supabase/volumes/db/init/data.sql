-- PRODUCTS --
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NULL,
    price DECIMAL(8, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)
);

-- USER_PROFILES --
CREATE TABLE IF NOT EXISTS user_profiles (
    "user_id" UUID NOT NULL,
    "favourite_product_id" UUID NULL,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "date_of_birth" DATE NULL,
    "phone_number" TEXT NULL,
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    
    CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT favourite_product_fkey FOREIGN KEY (favourite_product_id) REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ORDERS --
CREATE TABLE IF NOT EXISTS orders (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "total_price" DECIMAL(8, 2) NOT NULL DEFAULT 0,
    "status" VARCHAR(255) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT orders_status_check CHECK (status IN (
        'pending',
        'created',
        'preparing',
        'ready',
        'completed',
        'cancelled'
    ))
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- ORDER_PRODUCTS --
CREATE TABLE IF NOT EXISTS order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    -- UNIT PRICE AT TIME OF PURCHASE
    price DECIMAL(8, 2),
    custom JSON DEFAULT "{}",

    CONSTRAINT order_products_order_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_products_product_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- UPDATE ORDER TOTAL
CREATE OR REPLACE FUNCTION update_order_total_price()
RETURNS TRIGGER AS $$
DECLARE
  target_order_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_order_id := OLD.order_id;
  ELSE
    target_order_id := NEW.order_id;
  END IF;

  UPDATE orders
  SET total_price = (
    SELECT COALESCE(SUM(quantity * price), 0)
    FROM order_products
    WHERE order_id = target_order_id
  )
  WHERE id = target_order_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_total_after_insert
AFTER INSERT ON order_products
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price();

CREATE TRIGGER trg_update_order_total_after_update
AFTER UPDATE OF quantity, price ON order_products
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price();

CREATE TRIGGER trg_update_order_total_after_delete
AFTER DELETE ON order_products
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price();

-- SET ORDER PRICE WHEN INSERTING (product.price * order_product.quantity)
CREATE OR REPLACE FUNCTION set_order_product_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS NULL THEN
    SELECT p.price INTO NEW.price
    FROM products p
    WHERE p.id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_order_product_price
BEFORE INSERT ON order_products
FOR EACH ROW
EXECUTE FUNCTION set_order_product_price();

-- PAYMENTS --
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    user_id UUID NOT NULL,
    method VARCHAR(255) NOT NULL,
    amount DECIMAL(8, 2) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'pending',
    transaction_id UUID NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT payments_order_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT payments_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT payment_method_check CHECK (method IN (
        'cash',
        'card',
        'points'
    )),
    CONSTRAINT payment_status_check CHECK (status IN (
        'pending',
        'completed',
        'failed',
        'refunded'
    ))
);

-- LOYALTY_POINTS_TRANSACTIONS --
CREATE TABLE loyalty_point_transactions (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    payment_id UUID NOT NULL,
    points_change INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT loyalty_point_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT loyalty_point_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id),
    CHECK (reason IN (
        'earned',
        'redeemed',
        'used'
    ))
);

CREATE OR REPLACE FUNCTION update_loyalty_points_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET loyalty_points = loyalty_points + NEW.points_change
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_loyalty_points
AFTER INSERT ON loyalty_point_transactions
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_points_balance();

-- STOCK --
CREATE TABLE IF NOT EXISTS stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item TEXT NOT NULL,
    quantity DECIMAL(8, 2) NOT NULL CHECK (quantity >= 0),
    unit_type TEXT NOT NULL,  -- [grams, ml, pieces, etc.]
    max_capacity DECIMAL(8, 2) CHECK (max_capacity >= 0),
    reserved_quantity DECIMAL(8, 2) NOT NULL DEFAULT 0,

    CONSTRAINT stock_reserved_not_exceed_quantity CHECK (reserved_quantity <= quantity)
);

CREATE OR REPLACE FUNCTION validate_reserved_stock_on_order_products()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
  v_quantity_diff DECIMAL(8,2);
  v_stock RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_quantity_diff := NEW.quantity;
    v_product_id := NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_quantity_diff := NEW.quantity - OLD.quantity;
    v_product_id := NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN NEW;  -- No validation needed on delete
  ELSE
    RETURN NULL;
  END IF;

  -- Check each related stock item
  FOR v_stock IN
    SELECT s.id, s.quantity, s.reserved_quantity, ps.quantity AS per_unit_usage
    FROM stock s
    JOIN product_stock ps ON ps.stock_id = s.id
    WHERE ps.product_id = v_product_id
  LOOP
    IF (v_stock.reserved_quantity + (v_stock.per_unit_usage * v_quantity_diff)) > v_stock.quantity THEN
      RAISE EXCEPTION 
        'Insufficient stock for stock item "%". Available: %, Requested reserve: %',
        v_stock.id,
        v_stock.quantity - v_stock.reserved_quantity,
        (v_stock.per_unit_usage * v_quantity_diff);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_reserved_stock_on_order_products
BEFORE INSERT OR UPDATE ON order_products
FOR EACH ROW
EXECUTE FUNCTION validate_reserved_stock_on_order_products();

CREATE OR REPLACE FUNCTION adjust_reserved_stock_on_order_products()
RETURNS TRIGGER AS $$
DECLARE
  v_product_id UUID;
  v_quantity_diff DECIMAL(8,2);
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_quantity_diff := NEW.quantity;
    v_product_id := NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_quantity_diff := NEW.quantity - OLD.quantity;
    v_product_id := NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_quantity_diff := -OLD.quantity;
    v_product_id := OLD.product_id;
  ELSE
    RETURN NULL;
  END IF;

  -- Update reserved_quantity in stock for each stock item linked to the product
  UPDATE stock s
  SET reserved_quantity = reserved_quantity + (ps.quantity * v_quantity_diff)
  FROM product_stock ps
  WHERE ps.stock_id = s.id
    AND ps.product_id = v_product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_adjust_reserved_stock_order_products
AFTER INSERT OR UPDATE OR DELETE ON order_products
FOR EACH ROW
EXECUTE FUNCTION adjust_reserved_stock_on_order_products();

CREATE OR REPLACE FUNCTION finalize_stock_on_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Only act if status changed to ready or completed
  IF (NEW.status IN ('ready', 'completed')) AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    FOR rec IN
      SELECT op.product_id, op.quantity
      FROM order_products op
      WHERE op.order_id = NEW.id
    LOOP
      -- Reduce reserved_quantity and actual quantity in stock for related stock items
      UPDATE stock s
      SET quantity = s.quantity - (ps.quantity * rec.quantity),
          reserved_quantity = s.reserved_quantity - (ps.quantity * rec.quantity)
      FROM product_stock ps
      WHERE ps.stock_id = s.id AND ps.product_id = rec.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_finalize_stock_on_order_status
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION finalize_stock_on_order_status_change();

CREATE OR REPLACE FUNCTION release_reserved_stock_on_order_cancel()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Only act if status changed to cancelled
  IF (NEW.status = 'cancelled') AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    FOR rec IN
      SELECT op.product_id, op.quantity
      FROM order_products op
      WHERE op.order_id = NEW.id
    LOOP
      UPDATE stock s
      SET reserved_quantity = reserved_quantity - (ps.quantity * rec.quantity)
      FROM product_stock ps
      WHERE ps.stock_id = s.id AND ps.product_id = rec.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_release_reserved_stock_on_order_cancel
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION release_reserved_stock_on_order_cancel();


-- PRODUCT_STOCK --
CREATE TABLE IF NOT EXISTS product_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    stock_id UUID NOT NULL,
    -- Quantity of stock item used per unit of product
    quantity DECIMAL(8, 2) NOT NULL CHECK (quantity > 0),

    CONSTRAINT product_stock_product_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT product_stock_stock_fkey FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE,
    CONSTRAINT product_stock_unique UNIQUE (product_id, stock_id)
);

-- ORDER MODIFICATION --
CREATE TABLE IF NOT EXISTS custom_order_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_product_id UUID NOT NULL,
    stock_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('add', 'remove', 'replace')),
    quantity DECIMAL(8, 2) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_order_product FOREIGN KEY (order_product_id) REFERENCES order_products(id) ON DELETE CASCADE,
    CONSTRAINT fk_stock FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE
);


-- SEEDING --
-- STOCK --
INSERT INTO stock (item, quantity, unit_type, max_capacity) VALUES
('Coffee Beans', 10000, 'grams', 20000),
('Milk', 5000, 'ml', 10000),
('Sugar', 10000, 'grams', 20000),
('Ice', 3000, 'cubes', NULL);

-- PRODUCTS --
INSERT INTO products (name, description, price, stock_quantity) VALUES
('Ice Coffee', 'Ice Coffee.', 32.00, 10),
('Cappuccino', 'A rich espresso-based drink topped with steamed milk and foam.', 32.00, 10),
('Latte', 'Espresso with steamed milk and a light layer of foam.', 35.00, 20),
('Americano', 'Espresso diluted with hot water for a smooth black coffee.', 28.00, 25),
('Muffin', 'Freshly baked blueberry muffin.', 22.00, 5),
('Croissant', 'Buttery and flaky croissant, baked fresh daily.', 25.00, 5);

-- PRODUCT_STOCK --
INSERT INTO product_stock (product_id, stock_id, quantity) VALUES
((SELECT id FROM products WHERE name = 'Ice Coffee'), (SELECT id FROM stock WHERE item = 'Coffee Beans'), 10),
((SELECT id FROM products WHERE name = 'Ice Coffee'), (SELECT id FROM stock WHERE item = 'Sugar'), 5),
((SELECT id FROM products WHERE name = 'Ice Coffee'), (SELECT id FROM stock WHERE item = 'Milk'), 1);
