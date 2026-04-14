-- 1. Sync Existing Bookings to Customers table
-- This populates the CRM with unique customers identified by their phone number
INSERT INTO public.customers (full_name, phone, email, visit_count, total_spend, last_visit_at)
SELECT DISTINCT ON (customer_phone)
    customer_name as full_name,
    customer_phone as phone,
    customer_email as email,
    COUNT(*) OVER (PARTITION BY customer_phone) as visit_count,
    -- Attempt to sum prices (assuming numeric part of '₹500' etc)
    0 as total_spend, -- Will be updated by invoices/real spends later
    MAX(booking_date) OVER (PARTITION BY customer_phone) as last_visit_at
FROM public.bookings
ON CONFLICT (phone) DO UPDATE SET
    visit_count = EXCLUDED.visit_count,
    last_visit_at = GREATEST(customers.last_visit_at, EXCLUDED.last_visit_at);

-- 2. Create Automation Function for real-time CRM updates
CREATE OR REPLACE FUNCTION public.sync_customer_after_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Upsert the customer profile
    INSERT INTO public.customers (full_name, phone, email, last_visit_at, visit_count)
    VALUES (NEW.customer_name, NEW.customer_phone, NEW.customer_email, NEW.booking_date, 
            CASE WHEN NEW.status = 'Confirmed' THEN 1 ELSE 0 END)
    ON CONFLICT (phone) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(customers.email, EXCLUDED.email),
        last_visit_at = GREATEST(customers.last_visit_at, EXCLUDED.last_visit_at),
        visit_count = CASE 
            WHEN NEW.status = 'Confirmed' AND (OLD.status IS NULL OR OLD.status != 'Confirmed') 
            THEN customers.visit_count + 1 
            ELSE customers.visit_count 
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger (runs on all changes to ensure customers are always indexed)
DROP TRIGGER IF EXISTS tr_sync_customer_on_booking ON public.bookings;
CREATE TRIGGER tr_sync_customer_on_booking
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_after_booking();
