-- Migration: Add Sequential Invoice Numbering
-- This adds a professional sequential ID like AAR-2604-0001 to all invoices.

-- 1. Add a hidden serial ID for the sequence
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_serial_id BIGINT GENERATED ALWAYS AS IDENTITY;

-- 2. Add the formatted public Invoice Number column
-- Format: AAR-[YearMonth]-[4-digit Serial]
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_no TEXT GENERATED ALWAYS AS (
    'AAR-' || TO_CHAR(created_at, 'YYMM') || '-' || LPAD(invoice_serial_id::text, 4, '0')
) STORED;

-- 3. Verify
-- Every new invoice will now automatically have this number.
