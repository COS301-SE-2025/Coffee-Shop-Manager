CREATE OR REPLACE VIEW leaderboard_total_orders AS
SELECT
    o.user_id,
    COALESCE(u.display_name, 'Unknown') AS display_name,
    COUNT(*) AS total_orders
FROM orders o
LEFT JOIN user_profiles u ON o.user_id = u.user_id
WHERE o.status = 'completed'
GROUP BY o.user_id, u.display_name
ORDER BY total_orders DESC, display_name ASC, o.user_id ASC;