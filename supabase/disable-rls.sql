-- Temporarily disable RLS for testing
-- Run this in Supabase SQL Editor to see if RLS is causing issues

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments DISABLE ROW LEVEL SECURITY;

-- After testing, you can re-enable with:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
-- etc.
