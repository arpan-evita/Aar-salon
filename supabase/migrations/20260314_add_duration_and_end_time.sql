-- Add duration_minutes to services (default 30 for existing rows)
ALTER TABLE public.services ADD COLUMN duration_minutes INT NOT NULL DEFAULT 30;

-- Add booking_end_time to bookings
ALTER TABLE public.bookings ADD COLUMN booking_end_time TEXT;
