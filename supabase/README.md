# Supabase Database Setup

## Quick Setup (5 minutes)

### Step 1: Run the Schema SQL

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `schema.sql` file
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

You should see "Success. No rows returned" - that's perfect! ✅

### Step 2: Verify Tables Were Created

1. In Supabase Dashboard, click **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ trips
   - ✅ bookings
   - ✅ pending_bookings
   - ✅ attachments

### Step 3: Deploy Your App

Your database is ready! Now:
1. Make sure your Vercel environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - All other required vars (see `.env.example`)
2. Redeploy on Vercel (or it will auto-redeploy)
3. Visit your site and try signing in with Google!

---

## Database Schema Overview

### Tables

**users**
- Stores user accounts (email, name, auth provider)
- Each user gets a unique forwarding email

**trips**
- User's travel trips
- Can be shared via `shareToken`

**bookings**
- Individual bookings within a trip
- Supports flights, hotels, activities, etc.

**pending_bookings**
- Bookings parsed from forwarded emails
- User reviews before adding to trips

**attachments**
- Files attached to bookings (PDFs, images, etc.)

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Service role key is used for server-side operations
- All policies allow authenticated access via service role

---

## Troubleshooting

### "relation already exists"

If you see this error, tables were already created. You can:
- **Option 1:** Skip and continue (tables already exist!)
- **Option 2:** Drop and recreate by running this first:
  ```sql
  DROP TABLE IF EXISTS public.attachments CASCADE;
  DROP TABLE IF EXISTS public.bookings CASCADE;
  DROP TABLE IF EXISTS public.pending_bookings CASCADE;
  DROP TABLE IF EXISTS public.trips CASCADE;
  DROP TABLE IF EXISTS public.users CASCADE;
  ```
  Then run `schema.sql` again

### "Could not find the table"

Make sure:
1. You ran the full `schema.sql` script
2. Tables appear in **Table Editor**
3. Your `SUPABASE_SERVICE_ROLE_KEY` is correct

### RLS Policies Not Working

The current policies use `USING (true)` which allows all access when using the service role key. This is correct for server-side operations. If you want to add user-specific RLS later, you can update the policies.

---

## Next Steps

After setting up the database:

1. ✅ Verify environment variables in Vercel
2. ✅ Redeploy your app
3. ✅ Test Google sign-in
4. ✅ Create your first trip!

**Need help?** Check the main [README.md](../README.md) or [ENV_VARS_CHECKLIST.md](../ENV_VARS_CHECKLIST.md)
