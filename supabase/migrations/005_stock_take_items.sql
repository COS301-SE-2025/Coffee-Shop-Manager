-- STOCK_TAKE_ITEMS
CREATE TABLE IF NOT EXISTS stock_take_items (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stock_take_id UUID NOT NULL,
	stock_id UUID NOT NULL,
	snapshot_qty DECIMAL(8,2) NOT NULL,
	counted_qty DECIMAL(8,2) CHECK (counted_qty IS NULL OR counted_qty >= 0),
	entered_at TIMESTAMP WITH TIME ZONE NULL,
	
	CONSTRAINT stock_take_items_stock_take_fkey FOREIGN KEY (stock_take_id) REFERENCES stock_take(id) ON DELETE CASCADE,
	CONSTRAINT stock_take_items_stock_fkey FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE,
	CONSTRAINT stock_take_items_unique UNIQUE (stock_take_id, stock_id)
);
