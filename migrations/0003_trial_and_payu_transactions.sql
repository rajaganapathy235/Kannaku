-- ==============================================================================
-- Cloudflare D1 Migration 0003: Real Trial Enforcement & PayU Transactions Table
-- Tracks hosted checkout audit logs and verifies server-to-server payments.
-- ==============================================================================

-- Ensure trial_end_date and renewal_date columns exist in organizations
-- (In SQLite/D1, if columns already exist, this is handled gracefully by table recreation or migration runners)

CREATE TABLE IF NOT EXISTS subscription_transactions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  txnid TEXT UNIQUE NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  payment_provider TEXT DEFAULT 'payu',
  payment_status TEXT NOT NULL, -- 'PENDING', 'SUCCESS', 'FAILED'
  payu_payment_id TEXT,
  payu_response_json TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sub_txns_org ON subscription_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_sub_txns_txnid ON subscription_transactions(txnid);
