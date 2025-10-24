-- Returns top selling products by quantity, for completed orders, with optional date range
CREATE OR REPLACE FUNCTION get_top_selling_products(
  limit_count int default 5,
  start_date date default null,
  end_date date default null
)
RETURNS TABLE (
  product_id uuid,
  name text,
  total_quantity bigint,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    op.product_id,
    p.name,
    SUM(op.quantity) AS total_quantity,
    SUM(op.quantity * COALESCE(op.price, 0)) AS total_revenue
  FROM order_products op
  JOIN products p ON op.product_id = p.id
  JOIN orders o ON op.order_id = o.id
  WHERE o.status = 'completed'
    AND (start_date IS NULL OR o.created_at >= start_date::timestamp)
    AND (end_date IS NULL OR o.created_at < (end_date::timestamp + interval '1 day'))
  GROUP BY op.product_id, p.name
  ORDER BY total_quantity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;