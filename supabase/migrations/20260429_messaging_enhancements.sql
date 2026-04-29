-- Messaging Enhancements Migration

-- 1. Add direction to messaging_logs
ALTER TABLE messaging_logs
ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'Outbound'; -- 'Outbound' or 'Inbound'

-- 2. Create Business Settings table for API integrations
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_secret BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial configuration keys
INSERT INTO business_settings (setting_key, setting_value, description, is_secret)
VALUES 
('WHATSAPP_TOKEN', '', 'WhatsApp Business API Access Token', TRUE),
('WHATSAPP_PHONE_ID', '', 'WhatsApp Phone Number ID', FALSE),
('WHATSAPP_WEBHOOK_SECRET', '', 'Verify Token for Webhook', TRUE)
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS for settings
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON business_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Also allow authenticated users to view non-secret settings if needed, but for now restrict to admin
