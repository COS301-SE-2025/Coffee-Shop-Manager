-- Get total orders by status
CREATE OR REPLACE FUNCTION get_total_sales_by_status(
  order_status text default null,
  start_date date default null,
  end_date date default null
)
RETURNS numeric AS $$
DECLARE
  total_sales numeric;
BEGIN
  SELECT COALESCE(SUM(total_price), 0)
  INTO total_sales
  FROM orders
  WHERE (order_status IS NULL OR status = order_status::order_status_enum)
    AND (start_date IS NULL OR created_at >= start_date::timestamp)
    AND (end_date IS NULL OR created_at < (end_date::timestamp + interval '1 day'));

  RETURN total_sales;
END;
$$ LANGUAGE plpgsql STABLE;