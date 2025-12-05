# Database Initialization Guide

## If you can't access the app after login, the database might not be initialized.

### Run these commands:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull

# Initialize the database schema
npx prisma generate
npx prisma db push
```

This will create all the necessary tables in your Supabase database.

### Verify Database Setup

1. Go to your Supabase project
2. Click on "Table Editor" in the left sidebar
3. You should see these tables:
   - User
   - Trip
   - Booking
   - PendingBooking
   - Attachment
   - Session (created by NextAuth)
   - Account (created by NextAuth)
   - VerificationToken (created by NextAuth)

If these tables don't exist, run `npx prisma db push` again.

### Common Error Messages

**"User not found" or "Session not found":**
- Database tables aren't created
- Run `npx prisma db push`

**"Unauthorized" or keeps redirecting to login:**
- Session isn't being saved
- Check that DATABASE_URL is set correctly in Vercel
- Make sure you're using the Transaction mode URL from Supabase (not Session pooler)

**Blank page or infinite loading:**
- Check browser console for errors (F12)
- Could be a missing environment variable
