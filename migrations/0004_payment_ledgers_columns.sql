-- ==============================================================================
-- Cloudflare D1 Migration 0004: Add missing ledger columns to payment_ledgers
-- Supports normalized debit/credit bookkeeping and detailed voucher tracking
-- ==============================================================================

ALTER TABLE payment_ledgers ADD COLUMN entry_type TEXT;
ALTER TABLE payment_ledgers ADD COLUMN particular TEXT;
ALTER TABLE payment_ledgers ADD COLUMN vch_no TEXT;
ALTER TABLE payment_ledgers ADD COLUMN debit_credit TEXT;
