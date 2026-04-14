-- Salon Growth Platform Expansion Migration

-- 1. Create Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loyalty_tier') THEN
        CREATE TYPE loyalty_tier AS ENUM ('Silver', 'Gold', 'Platinum', 'VIP');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_tag') THEN
        CREATE TYPE customer_tag AS ENUM ('Active', 'Inactive', 'At-risk', 'VIP');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_type') THEN
        CREATE TYPE offer_type AS ENUM ('Percentage', 'Flat', 'BOGO', 'Combo');
    END IF;
END $$;

-- 2. Enhance Customers (Link to profiles and add salon-specific fields)
-- We'll use a table called 'customers' to store both logged-in users and walk-in clients.
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    gender TEXT,
    birthday DATE,
    anniversary DATE,
    preferred_stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
    loyalty_level loyalty_tier DEFAULT 'Silver',
    status customer_tag DEFAULT 'Active',
    notes TEXT,
    total_spend DECIMAL(12,2) DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Memberships
CREATE TABLE IF NOT EXISTS membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    validity_days INTEGER NOT NULL,
    benefits JSONB DEFAULT '[]',
    points_multiplier DECIMAL(4,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES membership_tiers(id),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Billing & Invoicing
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'Paid', -- Paid, Unpaid, Refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'service', 'product', 'package', 'membership'
    item_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL
);

-- 5. Offers & Promotions
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    code TEXT UNIQUE,
    type offer_type NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    min_spend DECIMAL(12,2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    targeting_logic JSONB DEFAULT '{}',
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Academy
CREATE TABLE IF NOT EXISTS academy_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER,
    price DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    max_students INTEGER,
    trainer_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'Upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES academy_batches(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id),
    student_name TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    total_fees DECIMAL(12,2) NOT NULL,
    paid_fees DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'Enrolled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Inventory
CREATE TABLE IF NOT EXISTS inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    purchase_price DECIMAL(12,2),
    retail_price DECIMAL(12,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    unit TEXT DEFAULT 'pcs',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES inventory_products(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Purchase', 'Sale', 'Consumption', 'Adjustment'
    quantity INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- 8. Lead Management (Multi-channel)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT, -- 'Website', 'Facebook', 'Instagram', 'Walk-in', 'Referral'
    interest TEXT, -- 'Academy', 'Service', 'Botox', etc.
    status TEXT DEFAULT 'New',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Messaging Logs
CREATE TABLE IF NOT EXISTS messaging_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    type TEXT NOT NULL, -- 'SMS', 'WhatsApp', 'Email'
    content TEXT NOT NULL,
    status TEXT DEFAULT 'Sent',
    campaign_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_logs ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies (Assuming admin/manager roles manage these)
-- For simplicity, we allow all authenticated users (staff) to read, and admin/manager to write.
-- This can be refined later.
CREATE POLICY "Staff can view customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Staff can view invoices" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

-- (Repeat similar for other tables as needed)
