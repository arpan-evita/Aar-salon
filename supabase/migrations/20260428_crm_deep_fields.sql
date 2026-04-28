-- AAR Salon CRM Deep Fields Migration
-- Adds missing CRM intelligence columns and new tables

-- 1. Enhance Customers table with full 360° CRM fields
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS hair_type TEXT,
  ADD COLUMN IF NOT EXISTS skin_concerns TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS preferred_services TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS offer_response_rate DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS churn_risk_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vip_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_bill_value DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visit_frequency_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES customers(id) ON DELETE SET NULL;

-- 2. Smart Segments Table
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  query_logic JSONB DEFAULT '{}',
  color TEXT DEFAULT '#D4AF37',
  icon TEXT DEFAULT 'Users',
  customer_count INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AI Suggestions Table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'revenue', 'retention', 'upsell', 'churn', 'staffing'
  priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  action_label TEXT,
  action_target TEXT, -- which tab to navigate to
  metadata JSONB DEFAULT '{}',
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Staff Reviews Table
CREATE TABLE IF NOT EXISTS staff_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  booking_id UUID,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reporting Snapshots Table (for historical trends)
CREATE TABLE IF NOT EXISTS reporting_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  repeat_customers INTEGER DEFAULT 0,
  avg_bill_value DECIMAL(12,2) DEFAULT 0,
  membership_revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(snapshot_date)
);

-- 6. Offer Redemptions Table
CREATE TABLE IF NOT EXISTS offer_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated staff can view, admins can manage)
CREATE POLICY "Staff can view segments" ON customer_segments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage segments" ON customer_segments FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Staff can view ai_suggestions" ON ai_suggestions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage ai_suggestions" ON ai_suggestions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Staff can view staff_reviews" ON staff_reviews FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage staff_reviews" ON staff_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Staff can view snapshots" ON reporting_snapshots FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage snapshots" ON reporting_snapshots FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Staff can view offer_redemptions" ON offer_redemptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage offer_redemptions" ON offer_redemptions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

-- 7. Function to compute churn risk score
CREATE OR REPLACE FUNCTION compute_churn_risk(last_visit TIMESTAMP WITH TIME ZONE, visit_count INTEGER)
RETURNS INTEGER AS $$
DECLARE
  days_since INTEGER;
  score INTEGER;
BEGIN
  IF last_visit IS NULL THEN RETURN 80; END IF;
  days_since := EXTRACT(DAY FROM NOW() - last_visit);
  score := 0;
  IF days_since > 60 THEN score := score + 50; END IF;
  IF days_since > 30 THEN score := score + 25; END IF;
  IF days_since > 14 THEN score := score + 15; END IF;
  IF visit_count <= 1 THEN score := score + 10; END IF;
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- 8. Update existing customers with computed scores
UPDATE customers
SET
  churn_risk_score = compute_churn_risk(last_visit_at, visit_count),
  vip_score = LEAST(
    CASE WHEN total_spend > 50000 THEN 100
         WHEN total_spend > 20000 THEN 75
         WHEN total_spend > 10000 THEN 50
         WHEN total_spend > 5000 THEN 30
         ELSE 10 END
    + CASE WHEN visit_count > 20 THEN 20
           WHEN visit_count > 10 THEN 10
           WHEN visit_count > 5 THEN 5
           ELSE 0 END,
    100
  ),
  avg_bill_value = CASE WHEN visit_count > 0 THEN total_spend / visit_count ELSE 0 END;
