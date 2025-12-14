-- Migration: Add mealType column to bookings table
-- Run this SQL in your Supabase SQL Editor if you have an existing database

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "mealType" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN bookings."mealType" IS 'Meal type: BREAKFAST, LUNCH, or DINNER (for RESTAURANT bookings)';
