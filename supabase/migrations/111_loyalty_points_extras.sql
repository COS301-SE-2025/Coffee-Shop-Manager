-- POLICIES
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can insert own loyalty points or admin" ON loyalty_points;
CREATE POLICY "User can insert own loyalty points or admin"
ON loyalty_points
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "User can select own loyalty points or admin" ON loyalty_points;
CREATE POLICY "User can select own loyalty points"
ON loyalty_points
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- Function to award loyalty points on completed order
create or replace function award_loyalty_points()
returns trigger as $$
declare
    earned_points integer;
begin
    -- Only act when an order becomes completed
    if NEW.status = 'completed' and (OLD.status is distinct from 'completed') then
        -- 1 point for every 10 in total_price
        earned_points := floor(NEW.total_price * 0.05 * 100);

        -- Insert into loyalty_points
        insert into loyalty_points (user_id, order_id, points, type, description)
        values (NEW.user_id, NEW.id, earned_points, 'earn', 'Points from completed order');
	end if;

    return NEW;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trg_award_points_after_order ON loyalty_points;
create trigger trg_award_points_after_order
after update on orders
for each row
execute function award_loyalty_points();

-- Function to update user_profiles loyalty_points balance
CREATE OR REPLACE FUNCTION update_loyalty_points_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Session variable to bypass trigger restriction on user_profiles columns
    PERFORM set_config('app.bypass_profile_update_check', 'on', true);
    IF NEW.points <> 0 THEN
        UPDATE user_profiles
        SET loyalty_points = loyalty_points + NEW.points
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_loyalty_points_balance ON loyalty_points;
CREATE TRIGGER trg_update_loyalty_points_balance
AFTER INSERT ON loyalty_points
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_points_balance();

-- Function to reverse loyalty points balance on delete
CREATE OR REPLACE FUNCTION update_loyalty_points_balance_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Session variable to bypass trigger restriction on user_profiles columns
    PERFORM set_config('app.bypass_profile_update_check', 'on', true);
    IF OLD.points <> 0 THEN
        UPDATE user_profiles
        SET loyalty_points = loyalty_points - OLD.points
        WHERE user_id = OLD.user_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Trigger to update balance after deleting a loyalty_points row
DROP TRIGGER IF EXISTS trg_update_loyalty_points_balance_on_delete ON loyalty_points;
CREATE TRIGGER trg_update_loyalty_points_balance_on_delete
AFTER DELETE ON loyalty_points
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_points_balance_on_delete();