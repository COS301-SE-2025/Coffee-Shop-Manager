-- PRODUCT_STOCK
CREATE TABLE IF NOT EXISTS product_stock (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	product_id UUID NOT NULL,
	stock_id UUID NOT NULL,
	quantity DECIMAL(8, 2) NOT NULL CHECK (quantity > 0),

	CONSTRAINT product_stock_product_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
	CONSTRAINT product_stock_stock_fkey FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE,
	CONSTRAINT product_stock_unique UNIQUE (product_id, stock_id)
);
