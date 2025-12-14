-- Migration: Add mealType and isAllDay columns to bookings table
-- Run this SQL in your Supabase SQL Editor if you have an existing database

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "mealType" TEXT;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "isAllDay" BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN bookings."mealType" IS 'Meal type: BREAKFAST, LUNCH, or DINNER (for RESTAURANT bookings)';
COMMENT ON COLUMN bookings."isAllDay" IS 'Whether this is an all-day activity';
