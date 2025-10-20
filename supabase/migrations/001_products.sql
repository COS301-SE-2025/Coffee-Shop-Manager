-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL UNIQUE,
	description TEXT NULL,
	price DECIMAL(8, 2) NOT NULL CHECK (price >= 0)
	-- stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)
);
