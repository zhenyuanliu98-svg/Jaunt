-- Test if tables exist and are accessible
-- Run this in Supabase SQL Editor

-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'trips', 'bookings', 'pending_bookings', 'attachments');

-- Check if users table is accessible
SELECT COUNT(*) as user_count FROM public.users;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'trips', 'bookings', 'pending_bookings', 'attachments');
