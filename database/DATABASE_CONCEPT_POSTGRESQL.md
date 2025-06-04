# Database Conceptual Outline (PostgreSQL with Multi-Tenancy)

This document outlines the conceptual database setup for the invoicing application using PostgreSQL, with a focus on a multi-tenancy architecture.

## 1. Multi-Tenancy Approach: Schema-per-Tenant

The chosen multi-tenancy strategy is **schema-per-tenant**.

*   **Tenant-Specific Schemas:** Each tenant (e.g., a company or organization using the SaaS platform) will have its own dedicated schema within the PostgreSQL database (e.g., `tenant_acme_corp`, `tenant_beta_llc`).
*   **Tenant Data Isolation:** Tables like `invoices`, `invoice_line_items`, `clients`, `payment_details`, etc., will reside within these individual tenant schemas, ensuring strong data isolation.
*   **Shared `public` Schema:**
    *   A `public` schema (or another specifically named shared schema) will contain:
        *   `users`: A global table for user authentication and basic profile information. This allows users to potentially belong to or access multiple tenants with a single login.
        *   `tenants`: A table to manage tenant metadata, such as tenant ID, schema name, subscription plan, domain/subdomain, status, etc.
        *   `user_tenant_access` (or similar): A mapping table to link users from the `public.users` table to specific tenants and define their roles/permissions within that tenant.
*   **Dynamic Schema Switching:** When a user logs in and selects a tenant (or if their tenant is determined by subdomain/host):
    *   The application's database connection for that user's session will be dynamically configured to use that tenant's schema.
    *   In PostgreSQL, this is typically achieved by setting the `search_path` for the current session: `SET search_path TO tenant_acme_corp, public;`. This makes tables in `tenant_acme_corp` directly accessible, falling back to `public` for shared tables.

### Pros of Schema-per-Tenant:
*   **Strong Data Isolation:** Excellent separation of tenant data.
*   **Schema Customization:** Easier to implement per-tenant schema customizations if needed in the future (though generally avoided for SaaS manageability).
*   **Backup/Restore:** Potentially simpler to backup and restore individual tenant data by targeting their schema.
*   **Query Performance:** Queries are typically against smaller datasets within a schema.

### Cons of Schema-per-Tenant:
*   **Management Complexity:** Managing a large number of schemas (migrations, updates) can be complex.
*   **Connection Management:** Requires careful handling of database connections to set the correct `search_path`.
*   **Cross-Tenant Reporting:** More complex if global, cross-tenant reporting is needed (requires querying across multiple schemas).

## 2. Conceptual SQL DDL

Below is the conceptual Data Definition Language (DDL) for the tables.

### a. Public Schema Tables

```sql
-- Located in the 'public' schema (or a dedicated shared schema)

CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_type VARCHAR(50) NOT NULL CHECK (profile_type IN ('freelance', 'accountant', 'sme', 'large_enterprise')), -- Could represent the primary role or default type
    full_name VARCHAR(255), -- Optional: for display purposes
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenants (
    id SERIAL PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL, -- e.g., "Acme Corp"
    schema_name VARCHAR(100) UNIQUE NOT NULL, -- e.g., "tenant_acme_corp", used for SET search_path
    subdomain VARCHAR(100) UNIQUE, -- Optional: for multi-tenant routing by subdomain
    subscription_plan VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_tenant_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role_in_tenant VARCHAR(50) NOT NULL, -- e.g., 'admin', 'member', 'viewer' (specific to the tenant context)
    -- This role_in_tenant can be used by the RBAC service within the context of that tenant.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, tenant_id) -- A user has one role per tenant through this table
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_tenants_schema_name ON public.tenants(schema_name);
CREATE INDEX IF NOT EXISTS idx_user_tenant_access_user_tenant ON public.user_tenant_access(user_id, tenant_id);
```

### b. Tenant-Specific Tables (Example for a tenant schema like `tenant_acme_corp`)

These tables would be created within *each tenant's dedicated schema* (e.g., `tenant_acme_corp.invoices`). The `user_id` in these tables refers to the `id` from the `public.users` table.

```sql
-- These tables reside WITHIN each tenant's schema (e.g., tenant_xyz.invoices)
-- The 'user_id' column will reference 'public.users(id)'

CREATE TABLE IF NOT EXISTS invoices ( -- e.g., tenant_acme_corp.invoices
    id SERIAL PRIMARY KEY,
    -- user_id refers to the creator/owner within the tenant context, from public.users
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE SET NULL, -- Or ON DELETE RESTRICT depending on policy
    client_id INTEGER, -- Placeholder, would reference a tenant_acme_corp.clients table
    client_name VARCHAR(255), -- Simplified if no separate clients table initially
    client_address TEXT,      -- Simplified
    invoice_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5, 4) DEFAULT 0.0000, -- e.g., 0.2000 for 20%
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- e.g., XOF, EUR
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'payment_pending', 'payment_failed')),
    notes TEXT,
    -- Payment related fields
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255), -- ID from payment gateway
    payment_status VARCHAR(50),          -- Status from payment gateway (e.g., 'pending_orangemoney', 'successful', 'failed')
    paid_at TIMESTAMPTZ,                 -- Timestamp when invoice was fully paid
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint to ensure invoice_number is unique within this tenant's schema
    UNIQUE (invoice_number)
);
-- Add constraint for client_id if a clients table is added:
-- FOREIGN KEY (client_id) REFERENCES clients(id)

CREATE TABLE IF NOT EXISTS invoice_line_items ( -- e.g., tenant_acme_corp.invoice_line_items
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL, -- Price HT (Hors Taxe)
    total_price DECIMAL(12, 2) NOT NULL, -- quantity * unit_price (HT)
    -- tax_rate_on_item DECIMAL(5,4), -- Optional: if line-item level VAT is ever needed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Future Tenant-Specific Tables:
-- CREATE TABLE IF NOT EXISTS clients (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE,
--     phone VARCHAR(50),
--     address TEXT,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- CREATE TABLE IF NOT EXISTS products_services (
--    id SERIAL PRIMARY KEY,
--    name VARCHAR(255) NOT NULL,
--    description TEXT,
--    default_unit_price DECIMAL(12,2),
--    default_tax_rate DECIMAL(5,4), -- Optional default tax for this product
--    created_at TIMESTAMPTZ DEFAULT NOW(),
--    updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Indexes for performance within tenant schemas
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id); -- If using client_id
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
```

## 3. Backend Interaction (Sequelize with Multi-Tenancy)

*   **Dynamic Schema in Sequelize:**
    *   When defining Sequelize models (e.g., `Invoice`, `InvoiceLineItem`), the schema can be specified dynamically or models can be initialized per tenant request.
    *   Alternatively, and more commonly for schema-per-tenant, the application sets the `search_path` for the PostgreSQL connection used by Sequelize.
*   **Middleware for Tenant Context:**
    *   A middleware in Express.js would be responsible for identifying the tenant based on the authenticated user's `user_tenant_access` record or other criteria (e.g., subdomain from `req.headers.host`).
    *   Once the `tenant_schema_name` (e.g., "tenant_acme_corp") is identified, this middleware would configure the Sequelize instance for the current request or set the `search_path` on the acquired database connection:
        ```javascript
        // Example middleware concept
        async function setTenantContext(req, res, next) {
            const userId = req.user.id; // Assuming user is authenticated
            // Simplified: assumes user has one primary tenant or selection mechanism
            const userTenantAccess = await db.public.UserTenantAccess.findOne({ where: { userId }});
            if (userTenantAccess) {
                const tenant = await db.public.Tenant.findByPk(userTenantAccess.tenantId);
                if (tenant && tenant.schema_name) {
                    req.tenant_schema = tenant.schema_name;
                    // For the current request's db connection:
                    await sequelize.query(`SET search_path TO "${tenant.schema_name}", public;`);
                }
            }
            next();
        }
        ```
*   **Sequelize Model Definitions:**
    *   Models like `Invoice` would be defined without a hardcoded schema. Sequelize will use the connection's current `search_path`.
    *   Associations will work correctly within the context of the selected schema.
*   **Migrations Across Schemas:**
    *   Managing database migrations (schema changes) across many tenant schemas requires a robust strategy.
    *   Tools like `db-migrate` can be adapted, or custom scripts might be needed to iterate through all tenant schemas and apply migrations.
    *   Sequelize migrations can be written to be schema-agnostic if they don't hardcode `public.` for tenant tables.

## 4. Database Connection Pooling

*   **Importance:** Essential for performance and scalability, especially in a multi-tenant application where many connections might be active or frequently opened/closed if not pooled.
*   **Sequelize Default:** Sequelize uses connection pooling by default (usually `pg-pool`).
*   **Configuration:** The pool size (`max`, `min` connections), idle timeout, etc., should be configured appropriately in the Sequelize connection options based on expected load and database server capacity.
*   **Tenant Context and Pooling:** Setting `search_path` is a session-level command. When a connection is taken from the pool, its `search_path` must be correctly set for the tenant of the current request. This needs to be done carefully to ensure connections are "cleaned" or reset before being returned to the pool or reused for a different tenant. Some strategies involve tagging connections in the pool or using a proxy like PgBouncer with careful configuration.

This conceptual outline provides a basis for setting up a multi-tenant PostgreSQL database. The actual implementation will require careful consideration of security, data migration strategies, and performance tuning.
