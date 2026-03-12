
-- Fix bookings: drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can read bookings" ON public.bookings;

-- Add user_id column to bookings for logged-in customers
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Customers can read their own bookings
CREATE POLICY "Customers can read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Staff/admin can read all bookings (already exists but recreate to be safe)
DROP POLICY IF EXISTS "Staff can read bookings" ON public.bookings;
CREATE POLICY "Staff can read all bookings" ON public.bookings
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'staff')
  );

-- Only admin/manager can update bookings
DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;
CREATE POLICY "Admin can update bookings" ON public.bookings
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

-- Fix services/stylists: drop overly permissive manage policies, keep public read
DROP POLICY IF EXISTS "Public manage services" ON public.services;
DROP POLICY IF EXISTS "Public manage stylists" ON public.stylists;

CREATE POLICY "Admin can manage services" ON public.services
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage stylists" ON public.stylists
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
