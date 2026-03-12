
-- Fix: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Customers can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can read all bookings" ON public.bookings;

CREATE POLICY "Customers can read own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can read all bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'staff')
  );
