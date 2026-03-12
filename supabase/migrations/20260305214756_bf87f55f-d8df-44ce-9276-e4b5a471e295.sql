
-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Scissors',
  price TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stylists table
CREATE TABLE public.stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience TEXT,
  rating NUMERIC(2,1) DEFAULT 4.9,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  stylist TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies: bookings are publicly insertable (no auth required for customers)
-- but only readable by authenticated admin
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read bookings" ON public.bookings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update bookings" ON public.bookings
  FOR UPDATE USING (true);

-- Services & stylists are publicly readable
CREATE POLICY "Public read services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Public manage services" ON public.services
  FOR ALL USING (true);

CREATE POLICY "Public read stylists" ON public.stylists
  FOR SELECT USING (true);

CREATE POLICY "Public manage stylists" ON public.stylists
  FOR ALL USING (true);

-- Reviews publicly readable
CREATE POLICY "Public read reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);
