# Supabase Database Setup Guide

This guide shows you how to set up your Supabase database for the Jaunt application.

## Prerequisites

- A Supabase account (free tier works fine)
- Your Supabase project created at [supabase.com](https://supabase.com)

## Step 1: Get Your Database Credentials

1. Go to your Supabase project
2. Click **Settings** (gear icon) in the left sidebar
3. Click **Database** in the Settings menu
4. Under **Connection String**, select **Transaction pooler** mode
5. Copy the connection string - you'll need this for `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Environment Variables Needed:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**To find these values:**
- `NEXT_PUBLIC_SUPABASE_URL`: Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Settings → API → service_role key (under "Project API keys")

⚠️ **Important:** The `service_role` key bypasses Row Level Security (RLS). Keep it secret! Never expose it in client-side code.

## Step 2: Create Database Tables

Run this SQL in the Supabase SQL Editor:

### Navigate to SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the SQL below
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Database Schema SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  "uniqueForwardEmail" TEXT UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "shareToken" TEXT UNIQUE,  -- For sharing trips
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tripId" UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- FLIGHT, ACCOMMODATION, CAR_RENTAL, etc.
  date DATE NOT NULL,
  time TEXT,
  "endDate" DATE,
  "endTime" TEXT,
  "confirmationNumber" TEXT,
  notes TEXT,
  cost DECIMAL(10, 2),
  city TEXT,  -- City where the booking takes place
  "typeSpecificData" JSONB,  -- Additional data specific to booking type
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending Bookings table (for email-forwarded bookings)
CREATE TABLE IF NOT EXISTS pending_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "rawEmail" TEXT NOT NULL,  -- Original email content
  "parsedData" JSONB,  -- AI-parsed booking data
  status TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table (for booking documents)
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bookingId" UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,  -- MIME type
  size INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_userId ON trips("userId");
CREATE INDEX IF NOT EXISTS idx_trips_shareToken ON trips("shareToken");
CREATE INDEX IF NOT EXISTS idx_bookings_tripId ON bookings("tripId");
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_city ON bookings(city);
CREATE INDEX IF NOT EXISTS idx_pending_bookings_userId ON pending_bookings("userId");
CREATE INDEX IF NOT EXISTS idx_attachments_bookingId ON attachments("bookingId");

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_bookings_updated_at BEFORE UPDATE ON pending_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Upgrade Existing Database (If Applicable)

If you already have a database set up and need to add the city column to existing bookings:

```sql
-- Add city column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_city ON bookings(city);
```

You can also find this migration in the `migrations/add_city_column.sql` file.

## Step 4: Set Up Row Level Security (RLS)

Supabase has RLS enabled by default. Since we're using the `service_role` key in the backend, our API routes will have full access. However, if you plan to use Supabase client-side in the future, you should add RLS policies.

For now, since the app uses `service_role` key (which bypasses RLS), you can skip this step.

### Optional: Add RLS Policies (for future client-side usage)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can view their own trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid()::text = "userId"::text);

-- Users can view trips shared with them
CREATE POLICY "Anyone can view shared trips"
  ON trips FOR SELECT
  USING ("shareToken" IS NOT NULL);

-- Users can manage their own trips
CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid()::text = "userId"::text);
```

## Step 5: Verify Setup

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `users`
   - `trips`
   - `bookings`
   - `pending_bookings`
   - `attachments`

3. Click on the `trips` table
4. Verify it has a `shareToken` column (type: TEXT)

## Step 6: Test the Share Functionality

1. Make sure your environment variables are set correctly
2. Deploy your app or run it locally
3. Sign in to your app
4. Create a trip
5. Click the **Share** button
6. If the clipboard permission is denied, you'll see a prompt with the share URL
7. The share URL should look like: `https://your-app.com/shared/abc123xyz`

## Troubleshooting

### Error: "Supabase environment variables are not configured"

**Solution:** Make sure you've set both environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

If deploying to Vercel, set these in your project settings under Environment Variables.

### Error: "Failed to update share token"

**Cause:** The `shareToken` column might not exist in your `trips` table.

**Solution:** Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE trips ADD COLUMN IF NOT EXISTS "shareToken" TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_trips_shareToken ON trips("shareToken");
```

### Error: "relation 'trips' does not exist"

**Cause:** Database tables haven't been created.

**Solution:** Run the full schema SQL from Step 2 above.

### Share link clipboard error

**Cause:** Browser denied clipboard permission (security feature).

**Solution:** This is now fixed! The app will show a prompt with the URL for manual copying. To avoid this in the future:
- Use HTTPS (required for clipboard API)
- Make sure the page is in focus when clicking Share

## Database Backup

It's good practice to backup your database schema:

```bash
# Using Supabase CLI
supabase db dump -f schema.sql

# Or export from Supabase dashboard:
# Settings → Database → Connection pooler → Download backup
```

## Next Steps

- ✅ Database tables created
- ✅ Environment variables set
- ✅ Share functionality working
- 📧 Optional: Set up email forwarding (see EMAIL_FORWARDING.md)
- 🔐 Optional: Configure RLS policies for client-side access

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)

---

**Questions?** Check the other documentation files:
- [ENV_VARS_CHECKLIST.md](./ENV_VARS_CHECKLIST.md) - Environment variables reference
- [DATABASE_INIT.md](./DATABASE_INIT.md) - General database setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
