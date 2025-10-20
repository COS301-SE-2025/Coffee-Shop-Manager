-- POLICIES
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin select stock_adjustments" ON stock_adjustments;
CREATE POLICY "Admin select stock_adjustments"
ON stock_adjustments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Admin insert stock_adjustments" ON stock_adjustments;
CREATE POLICY "Admin insert stock_adjustments"
ON stock_adjustments
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- No update or delete access, to enforce consistency with stock table

-- Check reference id
CREATE OR REPLACE FUNCTION enforce_stock_adjustments_fk()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_id IS NOT NULL THEN
        CASE NEW.reference_type
            WHEN 'stock_take' THEN
                PERFORM 1 FROM stock_take WHERE id = NEW.reference_id;
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Invalid reference_id for StockTake';
                END IF;
            WHEN 'user' THEN
                IF NEW.reference_id != auth.uid() THEN
        			RAISE EXCEPTION 'Invalid reference_id for User';
				END IF;
            WHEN 'order' THEN
                PERFORM 1 FROM orders WHERE id = NEW.reference_id;
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Invalid reference_id for Order';
                END IF;
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_stock_adjustments_fk
BEFORE INSERT OR UPDATE ON stock_adjustments
FOR EACH ROW
EXECUTE FUNCTION enforce_stock_adjustments_fk();