CREATE TYPE stock_adjustment_reference_type AS ENUM ('stock_take', 'order', 'user');

CREATE TABLE IF NOT EXISTS stock_adjustments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	stock_id UUID NOT NULL,
	adjustment_qty DECIMAL(8,2) NOT NULL,
	reference TEXT NOT NULL,
	reference_type stock_adjustment_reference_type NOT NULL,
	reference_id UUID NOT NULL, -- Can be from multiple sources (user, stock take, order) so fk not enforced
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT stock_adjustments_stock_fkey FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE CASCADE
);
