-- ==============================================================================
-- Cloudflare D1 Migration 0001: Initial Relational Multi-Tenant Schema
-- Compatibility: Cloudflare D1 (SQLite)
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
  address TEXT,
  city TEXT,
  state TEXT,
  pin TEXT,
  state_code TEXT DEFAULT '33',
  register_number TEXT,
  pan_number TEXT,
  bill_prefix TEXT DEFAULT 'INV/2026/',
  bank_details_json TEXT,
  terms_conditions TEXT,
  logo_url TEXT,
  stamp_url TEXT,
  signature_url TEXT,
  plan_id TEXT DEFAULT 'plan_pro',
  plan_name TEXT DEFAULT 'Pro Trader',
  subscription_status TEXT DEFAULT 'ACTIVE',
  account_status TEXT DEFAULT 'ACTIVE',
  billing_cycle TEXT DEFAULT 'YEARLY',
  subscription_start_date TEXT DEFAULT CURRENT_TIMESTAMP,
  renewal_date TEXT,
  trial_end_date TEXT,
  mrr_inr REAL DEFAULT 0,
  users_count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_active TEXT DEFAULT CURRENT_TIMESTAMP,
  payment_provider TEXT DEFAULT 'cashfree',
  custom_domain TEXT,
  notes TEXT
);

-- 2. USERS & RBAC ACCESS
CREATE TABLE IF NOT EXISTS platform_users (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OWNER',
  status TEXT DEFAULT 'ACTIVE',
  avatar_url TEXT,
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMER / SUPPLIER DIRECTORY
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  mobile TEXT,
  register_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pin TEXT,
  state_code TEXT,
  opening_balance REAL DEFAULT 0,
  current_balance REAL DEFAULT 0,
  credit_limit REAL DEFAULT 0,
  client_type TEXT DEFAULT 'customer',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS & HSN INVENTORY CATALOG
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  item_code TEXT,
  hsn_code TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'PCS',
  purchase_rate REAL DEFAULT 0,
  sales_rate REAL NOT NULL,
  mrp REAL,
  tax_percentage REAL DEFAULT 18.00,
  current_stock REAL DEFAULT 0,
  min_stock_alert REAL DEFAULT 5,
  subline1 TEXT,
  subline2 TEXT,
  subline3 TEXT,
  barcode TEXT,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. TAX INVOICES & BILLS
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  invoice_type INTEGER NOT NULL DEFAULT 1,
  invoice_date TEXT NOT NULL,
  due_date TEXT,
  po_number TEXT,
  client_id TEXT REFERENCES clients(id),
  client_name TEXT NOT NULL,
  client_gstin TEXT,
  client_address TEXT,
  client_city TEXT,
  client_state TEXT,
  client_mobile TEXT,
  place_of_supply TEXT,
  sub_total REAL NOT NULL DEFAULT 0,
  discount_total REAL DEFAULT 0,
  cgst_amount REAL DEFAULT 0,
  sgst_amount REAL DEFAULT 0,
  igst_amount REAL DEFAULT 0,
  total_tax REAL DEFAULT 0,
  tcs_percentage REAL DEFAULT 0,
  tcs_amount REAL DEFAULT 0,
  round_off REAL DEFAULT 0,
  grand_total REAL NOT NULL,
  paid_amount REAL DEFAULT 0,
  balance_amount REAL DEFAULT 0,
  payment_status TEXT DEFAULT 'UNPAID',
  payment_mode TEXT DEFAULT 'CASH',
  print_template TEXT DEFAULT 'modern',
  qr_code_upi TEXT,
  notes TEXT,
  terms TEXT,
  extra_items_json TEXT,
  consignee_json TEXT,
  calc_json TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. INVOICE LINE ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  name TEXT NOT NULL,
  hsn_code TEXT NOT NULL,
  qty REAL NOT NULL,
  unit TEXT DEFAULT 'PCS',
  rate REAL NOT NULL,
  mrp REAL,
  inclusive_or_exclusive TEXT DEFAULT 'exclusive',
  discount_percentage REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  tax_percentage REAL NOT NULL,
  tax_amount REAL NOT NULL,
  cgst_rate REAL DEFAULT 0,
  cgst_amount REAL DEFAULT 0,
  sgst_rate REAL DEFAULT 0,
  sgst_amount REAL DEFAULT 0,
  igst_rate REAL DEFAULT 0,
  igst_amount REAL DEFAULT 0,
  line_total REAL NOT NULL,
  subline1 TEXT,
  subline2 TEXT,
  subline3 TEXT
);

-- 7. PAYMENT LEDGER ENTRIES
CREATE TABLE IF NOT EXISTS payment_ledgers (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id),
  invoice_id TEXT REFERENCES invoices(id),
  entry_date TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  mode TEXT NOT NULL,
  amount REAL NOT NULL,
  reference_number TEXT,
  bank_account TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 8. AUDIT LOGS
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
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 9. IMPERSONATION SESSIONS
CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  tenant_email TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  ended_at TEXT,
  reason TEXT
);

-- INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);
CREATE INDEX IF NOT EXISTS idx_platform_users_org ON platform_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_num ON invoices(organization_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_inv ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_ledgers_org ON payment_ledgers(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
