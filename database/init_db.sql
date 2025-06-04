-- PostgreSQL Initialization Script
-- This script combines user and invoice schemas.

-- ==== General Setup ====
-- Optional: Set timezone (if not set globally)
-- SET TIME ZONE 'UTC';

-- ==== User Schema ====

-- Define an ENUM type for user_profile_type
CREATE TYPE user_profile_type AS ENUM (
    'freelance',
    'accountant',
    'sme',          -- Small and Medium Enterprise
    'large_enterprise'
);

-- Function to automatically update updated_at timestamp
-- This function is used by both users and invoices tables.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_type user_profile_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for users table
CREATE TRIGGER users_update_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profile_type ON users(profile_type);

-- ==== Invoice Schema ====

-- Define an ENUM type for invoice_status
CREATE TYPE invoice_status_type AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled'
);

-- Create the invoices table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Foreign Key to users table
    client_name VARCHAR(255) NOT NULL,
    client_address TEXT,
    client_email VARCHAR(255),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(4, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status invoice_status_type NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_invoice_user_invoice_number UNIQUE (user_id, invoice_number) -- Invoice number must be unique per user
);

-- Trigger for invoices table
CREATE TRIGGER invoices_update_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for invoices table
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
-- The unique constraint uq_invoice_user_invoice_number automatically creates an index on (user_id, invoice_number).

-- Comments for invoices table columns for clarity
COMMENT ON COLUMN invoices.items IS 'Line items, e.g., [{"description": "Web Development", "quantity": 10, "unit_price": 50.00, "total_price_per_item": 500.00}, ...]';
COMMENT ON COLUMN invoices.subtotal IS 'Total amount before taxes. Calculated by the application from items.';
COMMENT ON COLUMN invoices.tax_amount IS 'Total tax amount. Calculated by the application as subtotal * tax_rate.';
COMMENT ON COLUMN invoices.total_amount IS 'Total amount including taxes. Calculated by the application as subtotal + tax_amount.';
COMMENT ON COLUMN invoices.invoice_number IS 'Must be unique per user. Generation logic handled by the application.';

-- ==== End of Script ====
-- Note on Multi-Tenancy:
-- For the MVP, a single database with shared tables is used.
-- True multi-tenancy (e.g., schema per tenant, row-level security, or separate databases)
-- would be an advanced feature to implement later if required by business needs.

\echo 'Database initialization script completed.'
\echo 'ENUMs created: user_profile_type, invoice_status_type'
\echo 'Function created: update_updated_at_column()'
\echo 'Tables created: users, invoices (with triggers and indexes)'
