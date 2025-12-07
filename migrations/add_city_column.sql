-- Migration: Add city column to bookings table
-- Description: Adds a city field to track which city each booking is in
-- Date: 2025-12-07

-- Add city column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city TEXT;

-- Add index for better query performance when filtering by city
CREATE INDEX IF NOT EXISTS idx_bookings_city ON bookings(city);

-- Optional: Create a comment explaining the column
COMMENT ON COLUMN bookings.city IS 'The city where this booking takes place';
