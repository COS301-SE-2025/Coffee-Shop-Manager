-- MASTER SCHEMA FILE --

-- DROP TABLES --
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- IMPORT SCHEMA --
\i db/schema/users.sql
\i db/schema/orders.sql