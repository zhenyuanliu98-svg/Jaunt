# Vercel Build Troubleshooting Guide

## Build Error: "webpack errors" or "exited with 1"

This is a generic error. Follow these steps to identify and fix the issue.

## Step 1: Check Environment Variables (Most Common Issue)

### Required Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**You MUST set these for the build to succeed:**

```env
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<random-32-char-string>
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Get Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → Database
4. Under "Connection String" → Select **URI**
5. Copy the string and replace `[YOUR-PASSWORD]` with your database password
6. Use this as `DATABASE_URL` in Vercel

**Important:** Make sure to select **Production, Preview, and Development** when adding each variable!

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 2: Check Build Logs for Specific Error

1. In Vercel, click on the failed deployment
2. Click **View Build Logs**
3. Scroll to find the actual error (look for red text)

Common errors and solutions:

### Error: "Schema has not been generated yet"

**Cause:** `DATABASE_URL` not set or Prisma can't connect

**Fix:**
1. Verify `DATABASE_URL` is set in Vercel environment variables
2. Make sure the connection string is correct
3. Check that Supabase database is accessible
4. Redeploy after adding the variable

### Error: "Cannot find module '@/...' "

**Cause:** Import path issue or missing file

**Fix:**
1. Check the specific file mentioned in error
2. Verify the import path is correct
3. Ensure file exists in the repository

### Error: "Type error: Property '...' does not exist"

**Cause:** TypeScript compilation error

**Fix:**
1. Note the specific type error
2. May need to update type definitions
3. Share the error for specific fix

### Error: "Module not found: Can't resolve 'date-fns'"

**Cause:** Missing dependency

**Fix:**
```bash
npm install date-fns
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

## Step 3: Verify Package.json

Make sure your `package.json` has the `postinstall` script:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma Client is generated during build.

## Step 4: Check Supabase Database Access

### Verify Connection String Format

Should look like:
```
postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**NOT:**
```
postgresql://postgres.xxxxxxxxxxxxx:your-password@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```
(The pooler URL won't work for migrations)

### Test Connection Locally

```bash
# Set your DATABASE_URL locally
export DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Try to generate Prisma client
npx prisma generate

# Try to push schema
npx prisma db push
```

If this fails locally, it will fail on Vercel too.

## Step 5: Common Fixes

### Fix 1: Clear Build Cache

1. In Vercel Dashboard → Deployments
2. Click on failed deployment
3. Click "Redeploy" and check "Use existing Build Cache"
4. Uncheck it and redeploy

### Fix 2: Check Git Repository

Make sure all files are committed:
```bash
git status
git add .
git commit -m "Fix build"
git push
```

### Fix 3: Update Vercel CLI

```bash
npm i -g vercel@latest
vercel --version
```

## Step 6: Manual Build Test

Test the build locally:

```bash
# Install dependencies
npm install

# Set environment variable
export DATABASE_URL="your-supabase-url"

# Try to build
npm run build
```

If it fails locally, you'll see the actual error.

## Specific Error Solutions

### "Error: P1001: Can't reach database server"

**Cause:** Database URL is wrong or database is not accessible

**Fix:**
1. Double-check `DATABASE_URL` format
2. Ensure Supabase project is running
3. Check if you're using Transaction mode (not Session mode) URL
4. Verify password is correct

### "prepared statement \"s0\" already exists" (during Google/NextAuth callback)

**Cause:** Prisma is using prepared statements against a pooled/transaction connection (e.g., Vercel Postgres pooled string, Supabase PgBouncer), which rejects them.

**Fix:**
1. Append `?pgbouncer=true&connection_limit=1` to `DATABASE_URL` so Prisma uses simple queries.
2. Add `DIRECT_DATABASE_URL` with the non-pooled connection string for Prisma migrations.
3. Redeploy after updating environment variables and re-run `npx prisma db push` if needed.

### "Error: ENOENT: no such file or directory"

**Cause:** Missing file or incorrect path

**Fix:**
1. Check the file path mentioned in error
2. Verify file exists in repository
3. Check case sensitivity (GitHub is case-sensitive)

### "Error: Cannot read properties of undefined"

**Cause:** Runtime error, usually in server components

**Fix:**
1. Check the component mentioned in error
2. Add null checks for data
3. Ensure all required props are passed

## Debug Mode: Enable Detailed Logging

Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

## Still Stuck?

### Get Full Build Output

1. In Vercel deployment page, click **Download Build Logs**
2. Search for "Error:" or "Failed" in the logs
3. Share the specific error here

### Common Questions

**Q: Do I need all environment variables for build?**
A: Yes, at minimum you need `DATABASE_URL` for Prisma to generate the client.

**Q: Can I build without database?**
A: No, Prisma requires a database connection to generate the client during build.

**Q: Should I use Supabase pooler URL?**
A: No, use the direct connection URL (Transaction mode) for Prisma.

## Checklist

Before asking for help, verify:

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] `NEXTAUTH_URL` is set
- [ ] `NEXTAUTH_SECRET` is set (32+ characters)
- [ ] Google OAuth credentials are set
- [ ] All variables are set for "Production, Preview, Development"
- [ ] Supabase database is running and accessible
- [ ] Connection string is in correct format (Transaction mode)
- [ ] All code is committed and pushed to GitHub
- [ ] `package.json` has `postinstall` script
- [ ] Local build works (`npm run build`)

## Quick Fix Template

If you share the error, include:

1. **Error message** (exact text from build logs)
2. **Environment variables set** (names only, not values)
3. **Database provider** (Supabase/Vercel Postgres/other)
4. **Does local build work?** (yes/no)

This will help diagnose the issue faster!

## Working Configuration

Here's a working setup for reference:

**Vercel Environment Variables:**
```
DATABASE_URL=postgresql://postgres:password@db.abc123.supabase.co:5432/postgres
NEXTAUTH_URL=https://jaunt-abc123.vercel.app
NEXTAUTH_SECRET=random32charactersecrethere
GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123
```

**package.json:**
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**vercel.json:**
```json
{
  "buildCommand": "prisma generate && next build"
}
```

All of these are already configured in your repo! ✓
