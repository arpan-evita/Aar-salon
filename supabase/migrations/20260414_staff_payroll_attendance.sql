-- Enhance profiles with staff-specific fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS base_salary DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS shift_start TIME DEFAULT '10:00:00',
ADD COLUMN IF NOT EXISTS shift_end TIME DEFAULT '20:00:00';

-- Connect invoice items to staff for commission tracking
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.profiles(id);

-- Create staff attendance table
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    clock_out TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Present', -- Present, Late, Half-day
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff payroll records
CREATE TABLE IF NOT EXISTS public.staff_payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_amount DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) DEFAULT 0.00,
    bonus_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Paid, Draft
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_payroll ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view own attendance" ON public.staff_attendance
    FOR SELECT USING (auth.uid() = staff_id);

CREATE POLICY "Admins manage all attendance" ON public.staff_attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Staff can view own payroll" ON public.staff_payroll
    FOR SELECT USING (auth.uid() = staff_id);

CREATE POLICY "Admins manage all payroll" ON public.staff_payroll
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );
