-- POLICIES
ALTER TABLE stock_take_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin select stock_take_items" ON stock_take_items;
CREATE POLICY "Admin select stock_take_items"
ON stock_take_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

DROP POLICY IF EXISTS "Admin update stock_take_items" ON stock_take_items;
CREATE POLICY "Admin update stock_take_items"
ON stock_take_items
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), ARRAY['admin']::user_role_enum[])
);

-- No insert access since that is handled by db

-- Initialize stock_take_items table
CREATE OR REPLACE FUNCTION start_stock_take(p_created_by UUID)
RETURNS UUID AS $$
DECLARE
	v_existing UUID;
	v_new_id UUID := gen_random_uuid();
BEGIN
	-- Only allow admins to call this function
    IF NOT has_role(auth.uid(), ARRAY['admin']::user_role_enum[]) THEN
        RAISE EXCEPTION 'Only admins can start a stock take';
    END IF;

	-- Check if there is already an in-progress stock take
	SELECT id INTO v_existing
	FROM stock_take
	WHERE status = 'inprogress'
	LIMIT 1;

	IF v_existing IS NOT NULL THEN
		RAISE EXCEPTION 'Cannot start a new stock take: stock take % is already in progress', v_existing;
	END IF;

	-- Insert new stock take
	INSERT INTO stock_take(id, created_at, status, created_by)
	VALUES (v_new_id, NOW(), 'inprogress', p_created_by);

	-- Populate stock_take_items with snapshot of current stock
	INSERT INTO stock_take_items(stock_take_id, stock_id, snapshot_qty)
	SELECT v_new_id, id, quantity
	FROM stock;

	RETURN v_new_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Check for stock take completion, updates stock table if valid
CREATE OR REPLACE FUNCTION complete_stock_take(p_stock_take_id UUID, p_completed_by UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
	rec RECORD;
	adjustment DECIMAL(8,2);
BEGIN
	-- Ensure all items have counted_qty
	IF EXISTS (
		SELECT 1 FROM stock_take_items
		WHERE stock_take_id = p_stock_take_id AND counted_qty IS NULL
	) THEN
		RAISE EXCEPTION 'Cannot complete stock take: not all items have counted_qty entered';
	END IF;

	-- Update stock table and log adjustments
	FOR rec IN
		SELECT stock_id, snapshot_qty, counted_qty
		FROM stock_take_items
		WHERE stock_take_id = p_stock_take_id
	LOOP
		adjustment := rec.counted_qty - rec.snapshot_qty;

		-- Update actual stock quantity
		UPDATE stock
		SET quantity = rec.counted_qty
		WHERE id = rec.stock_id;

		-- Log adjustment
		IF adjustment <> 0 THEN
			INSERT INTO stock_adjustments(
				stock_id,
				adjustment_qty,
				reference,
				reference_id,
				reference_type
			)
			VALUES (
				rec.stock_id,
				adjustment,
				'stock take ',
				p_stock_take_id,
				'stock_take'
			);
		END IF;
	END LOOP;

	-- Mark stock take as complete
	UPDATE stock_take
	SET status = 'complete',
		completed_at = NOW(),
		completed_by = p_completed_by
	WHERE id = p_stock_take_id;
END;
$$ LANGUAGE plpgsql;

-- Update entered_at field when stock_item row is updated
CREATE OR REPLACE FUNCTION set_entered_at_on_counted_qty_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.counted_qty IS DISTINCT FROM OLD.counted_qty THEN
        NEW.entered_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_entered_at_on_counted_qty_update ON stock_take_items;
CREATE TRIGGER trg_set_entered_at_on_counted_qty_update
BEFORE UPDATE OF counted_qty ON stock_take_items
FOR EACH ROW
EXECUTE FUNCTION set_entered_at_on_counted_qty_update();