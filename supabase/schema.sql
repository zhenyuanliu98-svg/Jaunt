-- Jaunt Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  "passwordHash" TEXT,
  "authProvider" TEXT,
  "uniqueForwardEmail" TEXT UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "shareToken" TEXT UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "tripId" UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TEXT,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "endTime" TEXT,
  "confirmationNumber" TEXT,
  notes TEXT,
  cost DECIMAL(10, 2),
  "typeSpecificData" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending Bookings table
CREATE TABLE IF NOT EXISTS public.pending_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "rawEmail" TEXT NOT NULL,
  "parsedData" JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "bookingId" UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips("userId");
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON public.trips("startDate");
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON public.bookings("tripId");
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_pending_bookings_user_id ON public.pending_bookings("userId");
CREATE INDEX IF NOT EXISTS idx_pending_bookings_status ON public.pending_bookings(status);
CREATE INDEX IF NOT EXISTS idx_attachments_booking_id ON public.attachments("bookingId");

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow users to read their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (true);

-- Allow service role to insert/update users (for auth)
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL USING (true);

-- RLS Policies for trips table
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (true);

-- RLS Policies for bookings table
CREATE POLICY "Users can view bookings" ON public.bookings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update bookings" ON public.bookings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete bookings" ON public.bookings
  FOR DELETE USING (true);

-- RLS Policies for pending_bookings table
CREATE POLICY "Users can view own pending bookings" ON public.pending_bookings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert pending bookings" ON public.pending_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own pending bookings" ON public.pending_bookings
  FOR UPDATE USING (true);

-- RLS Policies for attachments table
CREATE POLICY "Users can view attachments" ON public.attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert attachments" ON public.attachments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete attachments" ON public.attachments
  FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_bookings_updated_at BEFORE UPDATE ON public.pending_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
