-- TABLE DEFINITION --
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    product_id VARCHAR(50) NOT NULL,
    price FLOAT NOT NULL,
    quantity INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONSTRAINTS --
ALTER TABLE orders  -- FOREIGN KEY --
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
    
ALTER TABLE orders  -- NOT NULL --
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN product_id SET NOT NULL,
    ALTER COLUMN price SET NOT NULL,
    ALTER COLUMN quantity SET NOT NULL;

-- MOCK DATA --
INSERT INTO orders (user_id, product_id, price, quantity) VALUES
(1, 'Coffee Beans', 5.99, 2),
(2, 'Espresso Machine', 120.00, 1);
