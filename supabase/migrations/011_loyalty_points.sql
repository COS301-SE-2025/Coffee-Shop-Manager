CREATE TYPE loyalty_point_type AS ENUM ('earn', 'redeem', 'bonus');

-- LOYALTY_POINTS
CREATE TABLE IF NOT EXISTS loyalty_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE SET NULL,
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    points integer NOT NULL,
    type loyalty_point_type NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);
