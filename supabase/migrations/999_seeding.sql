-- STOCK
INSERT INTO stock (item, quantity, unit_type, max_capacity)
VALUES
  ('Coffee Beans', 10000, 'grams', 20000),
  ('Milk', 5000, 'ml', 10000),
  ('Sugar', 10000, 'grams', 20000),
  ('Ice', 3000, 'cubes', NULL),
  ('Muffin', 10, 'unit', 50),
  ('Croissant', 10, 'unit', 50)
ON CONFLICT (item) DO NOTHING;

-- PRODUCTS
INSERT INTO products (name, description, price)
VALUES
  ('Ice Coffee', 'Ice Coffee.', 32.00),
  ('Cappuccino', 'A rich espresso-based drink topped with steamed milk and foam.', 32.00),
  ('Latte', 'Espresso with steamed milk and a light layer of foam.', 35.00),
  ('Americano', 'Espresso diluted with hot water for a smooth black coffee.', 28.00),
  ('Muffin', 'Freshly baked blueberry muffin.', 22.00),
  ('Croissant', 'Buttery and flaky croissant, baked fresh daily.', 25.00)
ON CONFLICT (name) DO NOTHING;

-- PRODUCT_STOCK (linking products to ingredients)
-- Drinks
INSERT INTO product_stock (product_id, stock_id, quantity) VALUES
  ((SELECT id FROM products WHERE name = 'Ice Coffee'), (SELECT id FROM stock WHERE item = 'Coffee Beans'), 10),
  ((SELECT id FROM products WHERE name = 'Ice Coffee'), (SELECT id FROM stock WHERE item = 'Sugar'), 5),
  ((SELECT id FROM products WHERE name = 'Ice Coffee'), (SELECT id FROM stock WHERE item = 'Milk'), 1),
  ((SELECT id FROM products WHERE name = 'Ice Coffee'), (SELECT id FROM stock WHERE item = 'Ice'), 3),
  ((SELECT id FROM products WHERE name = 'Cappuccino'), (SELECT id FROM stock WHERE item = 'Coffee Beans'), 10),
  ((SELECT id FROM products WHERE name = 'Cappuccino'), (SELECT id FROM stock WHERE item = 'Milk'), 2),
  ((SELECT id FROM products WHERE name = 'Latte'), (SELECT id FROM stock WHERE item = 'Coffee Beans'), 10),
  ((SELECT id FROM products WHERE name = 'Latte'), (SELECT id FROM stock WHERE item = 'Milk'), 3),
  ((SELECT id FROM products WHERE name = 'Americano'), (SELECT id FROM stock WHERE item = 'Coffee Beans'), 10),
  ((SELECT id FROM products WHERE name = 'Muffin'), (SELECT id FROM stock WHERE item = 'Muffin'), 1),
  ((SELECT id FROM products WHERE name = 'Croissant'), (SELECT id FROM stock WHERE item = 'Croissant'), 1)
ON CONFLICT DO NOTHING;

-- Products that are also stock items (e.g., Muffin, Croissant)
INSERT INTO product_stock (product_id, stock_id, quantity)
SELECT p.id, s.id, 1
FROM products p
JOIN stock s ON s.item = p.name
WHERE p.name IN ('Muffin', 'Croissant')
  AND NOT EXISTS (
    SELECT 1 FROM product_stock ps WHERE ps.product_id = p.id AND ps.stock_id = s.id
  );