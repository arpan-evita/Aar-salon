-- Fix: Add missing RLS policies for invoice_items and messaging_logs
-- Root cause: invoice_items had RLS enabled but NO insert/write policy,
-- causing every bill generation to fail with 400 Bad Request.
-- Note: CREATE POLICY does not support IF NOT EXISTS in PostgreSQL,
--       so we DROP first then CREATE.

-- Drop policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Staff can view invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can insert invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins can manage invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert messaging logs" ON public.messaging_logs;

-- 1. RLS policies for invoice_items
CREATE POLICY "Staff can view invoice items" 
    ON public.invoice_items FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert invoice items" 
    ON public.invoice_items FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage invoice items" 
    ON public.invoice_items FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- 2. Allow authenticated staff to insert invoices
CREATE POLICY "Authenticated users can insert invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- 3. Add missing columns to messaging_logs (schema fix)
ALTER TABLE public.messaging_logs 
    ADD COLUMN IF NOT EXISTS recipient_phone TEXT,
    ADD COLUMN IF NOT EXISTS message TEXT,
    ADD COLUMN IF NOT EXISTS channel TEXT;

-- 4. RLS for messaging_logs inserts
CREATE POLICY "Authenticated users can insert messaging logs"
    ON public.messaging_logs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
