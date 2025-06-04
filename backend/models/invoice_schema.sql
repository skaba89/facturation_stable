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
    invoice_number VARCHAR(100) NOT NULL, -- Application should ensure logic for generation (e.g., INV-001, prefix-timestamp)
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    items JSONB NOT NULL, -- Store line items as JSON array: [{description, quantity, unit_price, total_price_per_item}, ...]
    subtotal NUMERIC(12, 2) NOT NULL, -- Calculated by application: sum of total_price_per_item from items
    tax_rate NUMERIC(4, 2) DEFAULT 0.00, -- e.g., 0.20 for 20%. Application can set this.
    tax_amount NUMERIC(12, 2) NOT NULL, -- Calculated by application: subtotal * tax_rate
    total_amount NUMERIC(12, 2) NOT NULL, -- Calculated by application: subtotal + tax_amount
    currency VARCHAR(10) NOT NULL DEFAULT 'USD', -- e.g., 'USD', 'EUR', 'XOF'
    status invoice_status_type NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_invoice_user_invoice_number UNIQUE (user_id, invoice_number) -- Invoice number must be unique per user
);

-- Trigger to automatically update updated_at timestamp
-- (Assuming the function update_updated_at_column already exists from user_schema.sql)
-- If not, it should be defined here as well:
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

CREATE TRIGGER invoices_update_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
-- The unique constraint uq_invoice_user_invoice_number already creates an index on (user_id, invoice_number)
-- CREATE INDEX idx_invoices_user_invoice_number ON invoices(user_id, invoice_number);

COMMENT ON COLUMN invoices.items IS 'Line items, e.g., [{"description": "Web Development", "quantity": 10, "unit_price": 50.00, "total_price_per_item": 500.00}, ...]';
COMMENT ON COLUMN invoices.subtotal IS 'Total amount before taxes. Calculated by the application from items.';
COMMENT ON COLUMN invoices.tax_amount IS 'Total tax amount. Calculated by the application as subtotal * tax_rate.';
COMMENT ON COLUMN invoices.total_amount IS 'Total amount including taxes. Calculated by the application as subtotal + tax_amount.';
COMMENT ON COLUMN invoices.invoice_number IS 'Must be unique per user. Generation logic handled by the application.';
