-- Create expenses table for financial tracking
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL, -- Rent, Salary, Utility, Marketing, etc.
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    status TEXT DEFAULT 'Paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "authenticated_view_expenses" ON public.expenses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_manage_expenses" ON public.expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Seed some initial data for demonstration if the table is empty
INSERT INTO public.expenses (title, amount, category, expense_date, status)
SELECT 'Shop Rent - April', 45000, 'Rent', '2026-04-01', 'Paid'
WHERE NOT EXISTS (SELECT 1 FROM public.expenses WHERE title = 'Shop Rent - April');

INSERT INTO public.expenses (title, amount, category, expense_date, status)
SELECT 'Electricity Bill', 8500, 'Utility', '2026-04-05', 'Paid'
WHERE NOT EXISTS (SELECT 1 FROM public.expenses WHERE title = 'Electricity Bill');
