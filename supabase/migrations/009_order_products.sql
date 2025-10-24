CREATE TABLE IF NOT EXISTS order_products (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	order_id UUID NOT NULL,
	product_id UUID NOT NULL,
	quantity INTEGER NOT NULL DEFAULT 1,
	price DECIMAL(8, 2),

	CONSTRAINT order_products_order_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
	CONSTRAINT order_products_product_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
