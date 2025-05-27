# First-Time Setup for PostgreSQL

## 1. Install PostgreSQL

    sudo apt install postgresql postgresql-contrib

Note: `postgresql-contrib` is optional but provides useful additional features.

---

## 2. Verify Installation

Check the installed version:

    psql --version

Or connect to PostgreSQL as the `postgres` user and check the server version:

    sudo -i -u postgres psql -c "SELECT version();"

---

## 3. Create Database and User

### Step 1: Switch to the `postgres` system user

    sudo -i -u postgres
    psql

### Step 2: Create a PostgreSQL role for your Linux user

Replace `<linux_user>` with your Linux username:

    CREATE ROLE <linux_user> WITH LOGIN;

### Step 3: Create your database

Replace `<db_name>` with your desired database name:

    CREATE DATABASE <db_name>;

### Step 4: Exit the `psql` prompt and `postgres` user

    \q
    exit

---

## 4. Import the Database Schema

Run the import as your regular Linux user:

    psql -d <db_name> -f db/schema/init.sql

---

## 5. Connect to Your Database

To start interacting with your database:

    psql -d <db_name>

---

## 6. Enable PostgreSQL to Run at Startup

PostgreSQL is typically configured to start automatically on boot. To ensure this:

Enable the PostgreSQL service:

    sudo systemctl enable postgresql

You can also manually start or check the status with:

    sudo systemctl start postgresql
    sudo systemctl status postgresql
