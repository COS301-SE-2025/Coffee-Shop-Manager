CREATE TYPE order_status_enum AS ENUM (
    'pending',
    'completed',
    'cancelled'
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID, -- If a user deletes their account
	total_price DECIMAL(8, 2) NOT NULL DEFAULT 0,
	status order_status_enum NOT NULL DEFAULT 'pending',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW(),
	order_number BIGSERIAL UNIQUE,
	custom JSON,

	CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);
