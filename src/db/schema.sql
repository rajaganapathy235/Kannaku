-- ==============================================================================
-- KANNAKU SAAS - MULTI-TENANT DATABASE SCHEMA (PostgreSQL / Cloudflare D1 / Supabase)
-- Version: 4.2.0-cloud-production
-- Description: Complete Relational Schema for Cloudflare D1 / PostgreSQL
-- ==============================================================================

-- 1. SAAS TENANT ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_name TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    city TEXT,
    state TEXT,
    register_number TEXT, -- GSTIN
    plan_id TEXT DEFAULT 'plan_pro',
    plan_name TEXT DEFAULT 'Pro Trader',
    subscription_status TEXT DEFAULT 'ACTIVE', -- ACTIVE, TRIAL, PAST_DUE, CANCELLED
    account_status TEXT DEFAULT 'ACTIVE',      -- ACTIVE, SUSPENDED, DISABLED
    billing_cycle TEXT DEFAULT 'YEARLY',       -- MONTHLY, YEARLY
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    renewal_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    mrr_inr NUMERIC(12, 2) DEFAULT 0,
    users_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_provider TEXT DEFAULT 'cashfree',
    custom_domain TEXT,
    notes TEXT
);

-- 2. USERS & ACCESS ROLES (RBAC)
CREATE TABLE IF NOT EXISTS platform_users (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STAFF', -- OWNER, ADMIN, MANAGER, ACCOUNTANT, STAFF, SUPER_ADMIN
    status TEXT DEFAULT 'ACTIVE',
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMER / PARTY LEDGERS (CLIENTS)
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    mobile TEXT,
    register_number TEXT, -- Customer GSTIN
    address TEXT,
    city TEXT,
    state TEXT,
    pin TEXT,
    state_code TEXT,
    opening_balance NUMERIC(12, 2) DEFAULT 0,
    current_balance NUMERIC(12, 2) DEFAULT 0,
    credit_limit NUMERIC(12, 2) DEFAULT 0,
    client_type TEXT DEFAULT 'customer', -- customer, supplier, both
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS & INVENTORY (HSN CATALOG)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hsn_code TEXT NOT NULL,
    description TEXT,
    unit TEXT DEFAULT 'PCS',
    purchase_rate NUMERIC(12, 2) DEFAULT 0,
    sales_rate NUMERIC(12, 2) NOT NULL,
    mrp NUMERIC(12, 2),
    tax_percentage NUMERIC(5, 2) DEFAULT 18.00,
    current_stock NUMERIC(12, 2) DEFAULT 0,
    min_stock_alert NUMERIC(12, 2) DEFAULT 5,
    barcode TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TAX INVOICES & QUOTATIONS
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    invoice_type INTEGER NOT NULL DEFAULT 1, -- 1=Sales Tax Invoice, 2=Purchase, 3=Quotation
    invoice_date DATE NOT NULL,
    due_date DATE,
    po_number TEXT,
    client_id TEXT REFERENCES clients(id),
    client_name TEXT NOT NULL,
    client_gstin TEXT,
    client_address TEXT,
    client_city TEXT,
    client_state TEXT,
    client_mobile TEXT,
    place_of_supply TEXT,
    
    -- Financial Totals
    sub_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_total NUMERIC(12, 2) DEFAULT 0,
    cgst_amount NUMERIC(12, 2) DEFAULT 0,
    sgst_amount NUMERIC(12, 2) DEFAULT 0,
    igst_amount NUMERIC(12, 2) DEFAULT 0,
    total_tax NUMERIC(12, 2) DEFAULT 0,
    round_off NUMERIC(6, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL,
    
    -- Payment Reconciliation
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    balance_amount NUMERIC(12, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID, OVERDUE
    payment_mode TEXT DEFAULT 'CASH',     -- CASH, UPI, BANK_TRANSFER, CHEQUE
    
    -- Print Template & Flags
    print_template TEXT DEFAULT 'modern',
    qr_code_upi TEXT,
    notes TEXT,
    terms TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. INVOICE LINE ITEMS (WITH EMBEDDED TAX DECOMPOSITION)
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    name TEXT NOT NULL,
    hsn_code TEXT NOT NULL,
    qty NUMERIC(12, 2) NOT NULL,
    unit TEXT DEFAULT 'PCS',
    rate NUMERIC(12, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    tax_percentage NUMERIC(5, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    cgst_rate NUMERIC(5, 2) DEFAULT 0,
    cgst_amount NUMERIC(12, 2) DEFAULT 0,
    sgst_rate NUMERIC(5, 2) DEFAULT 0,
    sgst_amount NUMERIC(12, 2) DEFAULT 0,
    igst_rate NUMERIC(5, 2) DEFAULT 0,
    igst_amount NUMERIC(12, 2) DEFAULT 0,
    line_total NUMERIC(12, 2) NOT NULL
);

-- 7. PAYMENT LEDGER & CASH FLOW ENTRIES
CREATE TABLE IF NOT EXISTS payment_ledgers (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id),
    invoice_id TEXT REFERENCES invoices(id),
    entry_date DATE NOT NULL,
    payment_type TEXT NOT NULL, -- RECEIPT (Inflow) or PAYMENT (Outflow)
    mode TEXT NOT NULL,         -- CASH, UPI, NEFT, RTGS, CHEQUE
    amount NUMERIC(12, 2) NOT NULL,
    reference_number TEXT,
    bank_account TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ADMINISTRATIVE MUTATIONS & IMPERSONATION AUDIT TRAIL
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    admin_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    target_name TEXT,
    target_type TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS impersonation_sessions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    tenant_email TEXT NOT NULL,
    tenant_owner TEXT NOT NULL,
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    admin_role TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    reason TEXT NOT NULL,
    support_ticket_id TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    ip_address TEXT,
    status TEXT DEFAULT 'COMPLETED' -- ACTIVE, COMPLETED, REVOKED
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_users_org ON platform_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_org ON payment_ledgers(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
