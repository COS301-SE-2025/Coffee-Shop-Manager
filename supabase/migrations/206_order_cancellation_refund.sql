-- Create trigger function to refund stock when order is cancelled
CREATE OR REPLACE FUNCTION refund_stock_on_order_cancel()
RETURNS TRIGGER AS $$
DECLARE
    op_rec RECORD;
    ps_rec RECORD;
    refund_qty NUMERIC;
BEGIN
    -- Only process if order status changed to 'cancelled'
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- Get all order products for this order and refund their stock
        FOR op_rec IN
            SELECT product_id, quantity
            FROM order_products
            WHERE order_id = NEW.id
        LOOP
            -- For each product, get its stock requirements and refund
            FOR ps_rec IN
                SELECT stock_id, quantity AS per_unit_usage
                FROM product_stock
                WHERE product_id = op_rec.product_id
            LOOP
                refund_qty := ps_rec.per_unit_usage * op_rec.quantity;
                
                -- Refund the stock
                UPDATE stock
                SET quantity = quantity + refund_qty
                WHERE id = ps_rec.stock_id;
                
                -- Log the stock adjustment for audit trail
                INSERT INTO stock_adjustments (stock_id, adjustment_qty, reference, reference_type, reference_id)
                VALUES (
                    ps_rec.stock_id, 
                    refund_qty, 
                    'Order cancellation refund - Order ID: ' || NEW.id::TEXT,
                    'order',
                    NEW.id
                );
            END LOOP;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_refund_stock_on_order_cancel ON orders;
CREATE TRIGGER trg_refund_stock_on_order_cancel
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION refund_stock_on_order_cancel();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION refund_stock_on_order_cancel TO authenticated;
GRANT EXECUTE ON FUNCTION refund_stock_on_order_cancel TO service_role;