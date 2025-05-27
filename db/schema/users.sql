-- TABLE DEFINITION --
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONSTRAINTS --
ALTER TABLE users   -- UNIQUE --
    ADD CONSTRAINT unique_username UNIQUE (username),
    ADD CONSTRAINT unique_email UNIQUE (email);

-- MOCK DATA --
INSERT INTO users (username, email, password) VALUES
('Alice', 'Alice@example.com', 'temp'),
('Bob', 'Bob@example.com', 'temp');