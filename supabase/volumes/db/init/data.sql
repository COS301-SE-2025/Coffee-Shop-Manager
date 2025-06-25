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
        'completed'
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

    UNIQUE (order_id, product_id),
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
    max_capacity DECIMAL(8, 2) CHECK (max_capacity >= 0)
);

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
