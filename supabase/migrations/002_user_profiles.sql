CREATE TYPE user_role_enum AS ENUM (
    'user',
    'admin',
    'barista'
);

-- USER_PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
	user_id UUID NOT NULL PRIMARY KEY,
	display_name TEXT,
	email TEXT NOT NULL,
	role user_role_enum NOT NULL DEFAULT 'user',
	favourite_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
	total_orders INTEGER NOT NULL DEFAULT 0,
	total_spent DECIMAL(8, 2) NOT NULL DEFAULT 0,
	date_of_birth DATE NULL,
	phone_number TEXT NULL,
	loyalty_points INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	
	CONSTRAINT user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION has_role(uid uuid, roles user_role_enum[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = uid
      AND role = ANY(roles)
  );
END;
$$;
