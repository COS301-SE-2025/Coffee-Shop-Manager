-- Creates a SECURITY DEFINER function to upsert a payment row by order_id.
CREATE OR REPLACE FUNCTION public.upsert_payment(
    p_order_id uuid,
    p_user_id uuid,
    p_amount numeric,
    p_method text,
    p_status text,
    p_transaction_id text
) RETURNS void AS $$
BEGIN
    INSERT INTO public.payments (
        order_id, user_id, amount, method, status, transaction_id, created_at, updated_at
    ) VALUES (
        p_order_id, p_user_id, p_amount, p_method::payment_method, p_status::payment_status, p_transaction_id, NOW(), NOW()
    )
    ON CONFLICT (order_id) DO UPDATE
    SET amount = EXCLUDED.amount,
        method = EXCLUDED.method,
        status = EXCLUDED.status,
        transaction_id = EXCLUDED.transaction_id,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
