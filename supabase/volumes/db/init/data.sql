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
ta	rget_order_id UUID;
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
		RETURN NEW;
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
	op_rec RECORD;
	ps_rec RECORD;
	adj_qty DECIMAL(8,2);
	mod_rec RECORD;
BEGIN
	-- Only act if status changed to ready or completed
	IF (NEW.status IN ('ready', 'completed')) AND (OLD.status IS DISTINCT FROM NEW.status) THEN

		-- Loop through all products in the order
		FOR op_rec IN
			SELECT id AS order_product_id, product_id, quantity
			FROM order_products
			WHERE order_id = NEW.id
		LOOP

			-- Loop through each stock item for this product
			FOR ps_rec IN
				SELECT stock_id, quantity AS base_qty
				FROM product_stock
				WHERE product_id = op_rec.product_id
			LOOP
				-- Start with base quantity
				adj_qty := ps_rec.base_qty * op_rec.quantity;

				-- Apply any modifications for this order_product_id + stock_id
				FOR mod_rec IN
					SELECT action, quantity
					FROM custom_order_modifications
					WHERE order_product_id = op_rec.order_product_id
						AND stock_id = ps_rec.stock_id
				LOOP
					CASE mod_rec.action
						WHEN 'add' THEN adj_qty := adj_qty + mod_rec.quantity;
						WHEN 'remove' THEN adj_qty := adj_qty - mod_rec.quantity;
						WHEN 'replace' THEN adj_qty := mod_rec.quantity;
					END CASE;
				END LOOP;

				-- Update stock table
				UPDATE stock
				SET quantity = quantity - adj_qty,
					reserved_quantity = reserved_quantity - adj_qty
				WHERE id = ps_rec.stock_id;

				-- Log stock adjustment
				INSERT INTO stock_adjustments(
					stock_id, 
					adjustment_qty, 
					reference, 
					reference_id, 
					reference_type
				)
				VALUES (
					ps_rec.stock_id, 
					-adj_qty, 
					'product ordered', 
					NEW.id,
					'order'
				);
			END LOOP;

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

-- STOCK LOGGING --
CREATE TABLE IF NOT EXISTS stock_adjustments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stock_id UUID NOT NULL,
	adjustment_qty DECIMAL(8,2) NOT NULL,
	reference TEXT NOT NULL,
	reference_type TEXT NOT NULL CHECK (reference_type IN ('stock_take', 'order', 'user')),
	reference_id UUID NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

	CONSTRAINT stock_adjustments_stock_fkey FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE
);

-- CHECK REFERENCE_ID --
CREATE OR REPLACE FUNCTION enforce_stock_adjustments_fk()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_id IS NOT NULL THEN
        CASE NEW.reference_type
            WHEN 'stock_take' THEN
                PERFORM 1 FROM stock_take WHERE id = NEW.reference_id;
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Invalid reference_id for StockTake';
                END IF;
            WHEN 'user' THEN
                IF NEW.reference_id != auth.uid() THEN
        			RAISE EXCEPTION 'Invalid reference_id for User';
				END IF;
            WHEN 'order' THEN
                PERFORM 1 FROM orders WHERE id = NEW.reference_id;
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Invalid reference_id for Order';
                END IF;
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_stock_adjustments_fk
BEFORE INSERT OR UPDATE ON stock_adjustments
FOR EACH ROW
EXECUTE FUNCTION enforce_stock_adjustments_fk();

-- STOCK TAKES --
CREATE TABLE IF NOT EXISTS stock_take (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	take_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	take_date_completed TIMESTAMP WITH TIME ZONE,
	status TEXT NOT NULL DEFAULT 'inprogress',
	created_by UUID NOT NULL,
	completed_by UUID NULL,

	CONSTRAINT stock_take_status_check CHECK (status IN ('inprogress', 'complete')),
	CONSTRAINT stock_take_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
	CONSTRAINT stock_take_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ALLOW ONLY ONE ACTIVE STOCK TAKE AT A TIME --
CREATE UNIQUE INDEX IF NOT EXISTS one_active_stock_take
ON stock_take(status)
WHERE status = 'inprogress';

CREATE TABLE IF NOT EXISTS stock_take_items (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stock_take_id UUID NOT NULL,
	stock_id UUID NOT NULL,
	snapshot_qty DECIMAL(8,2) NOT NULL,
	counted_qty DECIMAL(8,2) NULL,
	entered_at TIMESTAMP WITH TIME ZONE NULL,
	
	CONSTRAINT stock_take_items_stock_take_fkey FOREIGN KEY (stock_take_id) REFERENCES stock_take(id) ON DELETE CASCADE,
	CONSTRAINT stock_take_items_stock_fkey FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE,
	CONSTRAINT stock_take_items_unique UNIQUE (stock_take_id, stock_id)
);

-- INITIALIZE STOCK_TAKE_ITEMS TABLE --
CREATE OR REPLACE FUNCTION start_stock_take(p_created_by UUID)
RETURNS UUID AS $$
DECLARE
	v_existing UUID;
	v_new_id UUID := gen_random_uuid();
BEGIN
	-- Check if there is already an in-progress stock take
	SELECT id INTO v_existing
	FROM stock_take
	WHERE status = 'inprogress'
	LIMIT 1;

	IF v_existing IS NOT NULL THEN
		RAISE EXCEPTION 'Cannot start a new stock take: stock take % is already in progress', v_existing;
	END IF;

	-- Insert new stock take
	INSERT INTO stock_take(id, take_date, status, created_by)
	VALUES (v_new_id, NOW(), 'inprogress', p_created_by);

	-- Populate stock_take_items with snapshot of current stock
	INSERT INTO stock_take_items(stock_take_id, stock_id, snapshot_qty)
	SELECT v_new_id, id, quantity
	FROM stock;

	RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- CHECKS FOR STOCK TAKE COMPLETION, UPDATES STOCK TABLE IF VALID --
CREATE OR REPLACE FUNCTION complete_stock_take(p_stock_take_id UUID, p_completed_by UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
	rec RECORD;
	adjustment DECIMAL(8,2);
BEGIN
	-- Ensure all items have counted_qty
	IF EXISTS (
		SELECT 1 FROM stock_take_items
		WHERE stock_take_id = p_stock_take_id AND counted_qty IS NULL
	) THEN
		RAISE EXCEPTION 'Cannot complete stock take: not all items have counted_qty entered';
	END IF;

	-- Update stock table and log adjustments
	FOR rec IN
		SELECT stock_id, snapshot_qty, counted_qty
		FROM stock_take_items
		WHERE stock_take_id = p_stock_take_id
	LOOP
		adjustment := rec.counted_qty - rec.snapshot_qty;

		-- Update actual stock quantity
		UPDATE stock
		SET quantity = rec.counted_qty
		WHERE id = rec.stock_id;

		-- Log adjustment
		IF adjustment <> 0 THEN
			INSERT INTO stock_adjustments(
				stock_id,
				adjustment_qty,
				reference,
				reference_id,
				reference_type
			)
			VALUES (
				rec.stock_id,
				adjustment,
				'stock take ',
				p_stock_take_id,
				'stock_take'
			);
		END IF;
	END LOOP;

	-- Mark stock take as complete
	UPDATE stock_take
	SET status = 'complete',
		take_date_completed = NOW(),
		completed_by = p_completed_by
	WHERE id = p_stock_take_id;
END;
$$ LANGUAGE plpgsql;

-- GAMIFICATION --
CREATE VIEW leaderboard_total_orders AS
SELECT
    user_id,
    COUNT(*) AS total_orders
FROM orders
WHERE status = 'completed'
GROUP BY user_id
ORDER BY total_orders DESC;

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
