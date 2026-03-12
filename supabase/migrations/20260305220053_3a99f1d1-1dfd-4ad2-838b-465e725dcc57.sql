
-- Drop any leftover permissive policies just to be safe
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;

-- Tighten the existing admin update policy to use TO authenticated
DROP POLICY IF EXISTS "Admin can update bookings" ON public.bookings;
CREATE POLICY "Admin can update bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );
