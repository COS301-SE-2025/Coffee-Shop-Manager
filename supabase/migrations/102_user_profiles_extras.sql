-- POLICIES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own profile" ON user_profiles;
CREATE POLICY "Users can select own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Users can update own profile or admin" ON user_profiles;
CREATE POLICY "Users can update own profile or admin"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- Trigger to allow only certain fields to be updated
DROP FUNCTION IF EXISTS enforce_user_profile_update_columns() CASCADE;
CREATE FUNCTION enforce_user_profile_update_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('app.bypass_profile_update_check', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NOT has_role(auth.uid(), ARRAY['admin']::user_role_enum[]) AND NEW.user_id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role
      OR NEW.favourite_product_id IS DISTINCT FROM OLD.favourite_product_id
      OR NEW.total_orders IS DISTINCT FROM OLD.total_orders
      OR NEW.total_spent IS DISTINCT FROM OLD.total_spent
      OR NEW.loyalty_points IS DISTINCT FROM OLD.loyalty_points
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
      OR NEW.email IS DISTINCT FROM OLD.email
    THEN
      RAISE EXCEPTION 'You can only update display_name, date_of_birth, or phone_number';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_user_profile_update_columns ON user_profiles;
CREATE TRIGGER trg_enforce_user_profile_update_columns
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION enforce_user_profile_update_columns();

DROP POLICY IF EXISTS "Users can delete or admin" ON user_profiles;
CREATE POLICY "Users can delete or admin"
ON user_profiles
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- Insert into user_profiles when user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    display_name,
    email,
    created_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''),
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Backfill user_profiles for existing users in auth.users
INSERT INTO public.user_profiles (user_id, display_name, email, created_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'display_name', u.email),
  u.email,
  NOW()
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.user_id = u.id
WHERE up.user_id IS NULL;
