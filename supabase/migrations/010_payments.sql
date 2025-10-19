CREATE TYPE payment_method AS ENUM ('cash', 'card', 'points');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	order_id UUID NOT NULL UNIQUE,
	user_id UUID NOT NULL,
	method payment_method NOT NULL,
	amount DECIMAL(8, 2) NOT NULL,
	status payment_status NOT NULL DEFAULT 'pending',
	transaction_id TEXT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT payments_order_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
	CONSTRAINT payments_user_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);