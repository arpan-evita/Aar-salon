-- CRM Growth Engine Migration

-- 1. Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'booking_confirmed', 'booking_completed', 'birthday', 'inactivity', 'membership_expiring'
    delay_days INTEGER DEFAULT 0,
    message_template TEXT NOT NULL,
    channel TEXT DEFAULT 'WhatsApp', -- 'WhatsApp', 'SMS', 'Email'
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}', -- Store conditions like 'min_spend', 'tag', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_segment JSONB DEFAULT '{}', -- e.g. { "tag": "VIP", "min_ltv": 5000 }
    message_template TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Scheduled', 'Sent', 'Cancelled'
    sent_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- 3. Update Customers with Marketing Consent
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMP WITH TIME ZONE;

-- 4. Staff Performance Metrics View
-- This view consolidates revenue and bookings per stylist
CREATE OR REPLACE VIEW staff_performance_summary AS
SELECT 
    s.id as stylist_id,
    s.name as stylist_name,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'Confirmed' THEN 1 ELSE 0 END) as completed_bookings,
    COALESCE(SUM(i.total), 0) as total_revenue,
    AVG(CASE WHEN b.status = 'Confirmed' THEN 5.0 ELSE NULL END) as average_rating
FROM 
    stylists s
LEFT JOIN 
    bookings b ON b.stylist = s.name
LEFT JOIN 
    invoices i ON i.customer_id = (SELECT id FROM customers WHERE full_name = b.customer_name LIMIT 1) 
    AND i.created_at::date = b.booking_date::date
GROUP BY 
    s.id, s.name;

-- 5. Seed Initial Automation Rules
INSERT INTO automation_rules (name, trigger_type, delay_days, message_template, channel)
VALUES 
('Appointment Confirmation', 'booking_confirmed', 0, 'Hi {{name}}, your appointment at AAR Salon is confirmed for {{date}} at {{time}} with {{stylist}}. See you soon!', 'WhatsApp'),
('Post-Service Review', 'booking_completed', 1, 'Hi {{name}}, we hope you loved your service! Please share your feedback here: {{review_link}}. Your review helps us grow!', 'WhatsApp'),
('Re-engagement (30 Days)', 'inactivity', 30, 'Hi {{name}}, we miss you! It has been 30 days since your last visit. Here is a 10% discount on your next haircut. Book now!', 'WhatsApp'),
('Birthday Wish', 'birthday', 0, 'Happy Birthday {{name}}! 🎂 Treat yourself to a special 20% discount on any service this week. Happy pampering!', 'WhatsApp')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation_rules" ON automation_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Admins can manage campaigns" ON campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);
