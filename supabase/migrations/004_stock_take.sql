CREATE TYPE stock_take_status AS ENUM ('inprogress', 'complete');

-- STOCK_TAKE
CREATE TABLE IF NOT EXISTS stock_take (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	status stock_take_status NOT NULL DEFAULT 'inprogress',
	created_by UUID NOT NULL,
	completed_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL,

	CONSTRAINT stock_take_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(user_id) ON DELETE SET NULL,
	CONSTRAINT stock_take_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES user_profiles(user_id) ON DELETE SET NULL
);
