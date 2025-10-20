-- STOCK
CREATE TABLE IF NOT EXISTS stock (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	item TEXT NOT NULL UNIQUE,
	quantity DECIMAL(8, 2) NOT NULL CHECK (quantity >= 0),
	unit_type TEXT NOT NULL,
	-- stock qty can be > max_capacity since its only used to show remaining stock as a percentage
	max_capacity DECIMAL(8, 2) CHECK (max_capacity >= 0)
);
