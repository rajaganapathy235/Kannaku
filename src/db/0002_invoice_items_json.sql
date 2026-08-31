-- ==============================================================================
-- Cloudflare D1 Migration 0002: Add items_json column to invoices for single-write optimization
-- Reduces multi-row write operations from N+1 rows to 1-2 rows per invoice
-- ==============================================================================

ALTER TABLE invoices ADD COLUMN items_json TEXT;
