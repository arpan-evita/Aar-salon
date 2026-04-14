-- Enable administrative deletion of bookings
-- This ensures that only staff with admin or manager roles can permanently remove records

CREATE POLICY "Staff can delete bookings" ON public.bookings
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'manager'::public.app_role)
  );
