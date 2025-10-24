-- Create atomic order creation function
CREATE OR REPLACE FUNCTION create_order_atomic(
    p_user_id UUID,
    p_custom JSON DEFAULT NULL,
    p_products JSONB DEFAULT '[]'::JSONB
)
RETURNS TABLE(order_id UUID, success BOOLEAN, error_message TEXT) AS $$
DECLARE
    v_order_id UUID;
    v_product JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    ps_rec RECORD;
    current_stock_qty NUMERIC;
    required_qty NUMERIC;
BEGIN
    -- Validate input
    IF p_user_id IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 'User ID cannot be null';
        RETURN;
    END IF;
    
    IF p_products IS NULL OR jsonb_array_length(p_products) = 0 THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Products array cannot be empty';
        RETURN;
    END IF;
    
    -- FIRST: Validate all stock requirements WITHOUT creating any records
    FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        v_product_id := (v_product->>'product_id')::UUID;
        v_quantity := (v_product->>'quantity')::INTEGER;
        
        -- Check if product exists in product_stock
        IF NOT EXISTS (SELECT 1 FROM product_stock WHERE product_id = v_product_id) THEN
            RETURN QUERY SELECT NULL::UUID, FALSE, 'Product ' || v_product_id::TEXT || ' has no stock requirements defined';
            RETURN;
        END IF;
        
        -- Check stock availability for this product
        FOR ps_rec IN
            SELECT stock_id, quantity AS per_unit_usage
            FROM product_stock
            WHERE product_id = v_product_id
        LOOP
            -- Get current stock quantity
            SELECT quantity INTO current_stock_qty FROM stock WHERE id = ps_rec.stock_id;
            
            -- If stock item doesn't exist, that's an error
            IF current_stock_qty IS NULL THEN
                RETURN QUERY SELECT NULL::UUID, FALSE, 'Stock item ' || ps_rec.stock_id::TEXT || ' does not exist';
                RETURN;
            END IF;
            
            required_qty := ps_rec.per_unit_usage * v_quantity;
            
            -- Check availability - FAIL FAST if insufficient (no order created)
            IF current_stock_qty < required_qty THEN
                RETURN QUERY SELECT NULL::UUID, FALSE, 'Not enough stock for item ' || ps_rec.stock_id::TEXT || '. Required: ' || required_qty::TEXT || ', Available: ' || current_stock_qty::TEXT;
                RETURN;
            END IF;
        END LOOP;
    END LOOP;
    
    -- ALL VALIDATIONS PASSED - Now create the order
    INSERT INTO orders (user_id, custom)
    VALUES (p_user_id, p_custom)
    RETURNING id INTO v_order_id;
    
    -- Process each product with RACE-CONDITION SAFE stock deduction
    FOR v_product IN SELECT * FROM jsonb_array_elements(p_products)
    LOOP
        v_product_id := (v_product->>'product_id')::UUID;
        v_quantity := (v_product->>'quantity')::INTEGER;
        
        -- ATOMIC: Deduct stock with race condition protection
        FOR ps_rec IN
            SELECT stock_id, quantity AS per_unit_usage
            FROM product_stock
            WHERE product_id = v_product_id
        LOOP
            required_qty := ps_rec.per_unit_usage * v_quantity;
            
            -- RACE-CONDITION SAFE: Check and deduct stock atomically
            UPDATE stock
            SET quantity = quantity - required_qty
            WHERE id = ps_rec.stock_id 
              AND quantity >= required_qty; -- Only update if sufficient stock exists
            
            -- Check if the update actually happened
            IF NOT FOUND THEN
                -- Race condition: Another transaction took the stock between our validation and deduction
                SELECT quantity INTO current_stock_qty FROM stock WHERE id = ps_rec.stock_id;
                -- RAISE EXCEPTION to trigger transaction rollback (removes order record)
                RAISE EXCEPTION 'Race condition: Stock for item % was taken by another order. Available: %, Required: %', 
                    ps_rec.stock_id, COALESCE(current_stock_qty, 0), required_qty
                    USING ERRCODE = 'P0001';
            END IF;
        END LOOP;
        
        -- Stock successfully deducted, now insert order_product
        INSERT INTO order_products (order_id, product_id, quantity)
        VALUES (v_order_id, v_product_id, v_quantity);
    END LOOP;
    
    -- All products processed successfully
    RETURN QUERY SELECT v_order_id, TRUE, 'Order created successfully'::TEXT;
    
EXCEPTION 
    WHEN SQLSTATE 'P0001' THEN
        -- Race condition exception - return user-friendly error without order_id
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Not enough stock available - another customer may have just purchased this item. Please try again.'::TEXT;
    WHEN OTHERS THEN
        -- Any other error will rollback the entire transaction (including order creation)
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Database error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION create_order_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_atomic TO service_role;