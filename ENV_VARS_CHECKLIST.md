# Environment Variables Checklist for Vercel

Copy this checklist when setting up environment variables in Vercel.

## 🚨 Required Variables (App Won't Work Without These)

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
```
- **If using Vercel Postgres**: Auto-set by Vercel ✓
- **If using external DB**: Get from your database provider

### NextAuth
```
NEXTAUTH_URL=https://your-app.vercel.app
```
- Replace with your actual Vercel URL
- Update when adding custom domain

```
NEXTAUTH_SECRET=<generate-random-string>
```
- Generate with: `openssl rand -base64 32`
- Must be at least 32 characters
- Keep this secret!

### Google OAuth
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```
- Get from [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 Client ID
- Add redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

---

## 📧 Optional Variables (For Email Forwarding Feature)

### SendGrid
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
EMAIL_DOMAIN=jaunt.app
```
- Get from [SendGrid](https://sendgrid.com)
- Only needed if you want email forwarding
- Can skip for MVP and add later

---

## 🍎 Optional Variables (For Apple Sign In)

```
APPLE_ID=com.yourcompany.jaunt
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----
APPLE_KEY_ID=XXXXXXXXXX
```
- Get from [Apple Developer](https://developer.apple.com)
- Only needed if you want Apple authentication
- Google OAuth is sufficient for MVP

---

## 📋 Quick Setup Order

### Step 1: Database (Choose One)

**Option A: Vercel Postgres** (Recommended)
1. In Vercel: Storage → Create Database → Postgres
2. `DATABASE_URL` is auto-set ✓

**Option B: Supabase** (Free, Generous Limits)
1. Create project at [supabase.com](https://supabase.com)
2. Settings → Database → Connection String (Transaction mode)
3. Copy to `DATABASE_URL`

**Option C: Railway** (Easy Setup)
1. Create database at [railway.app](https://railway.app)
2. Copy connection string to `DATABASE_URL`

### Step 2: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy output → `NEXTAUTH_SECRET` in Vercel

### Step 3: Get Your Vercel URL

After first deployment:
1. Go to Vercel Dashboard → Your Project
2. Copy the deployment URL (e.g., `jaunt-abc123.vercel.app`)
3. Set as `NEXTAUTH_URL=https://jaunt-abc123.vercel.app`

### Step 4: Set Up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create Project (or use existing)
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Application Type: Web Application
6. Authorized Redirect URIs:
   ```
   https://your-vercel-url.vercel.app/api/auth/callback/google
   ```
7. Copy Client ID and Client Secret
8. Add to Vercel environment variables

### Step 5: Initialize Database

After environment variables are set:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull env vars locally
vercel env pull

# Initialize database schema
npx prisma generate
npx prisma db push
```

---

## 🔍 How to Set in Vercel

### Via Vercel Dashboard

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXTAUTH_SECRET`)
   - **Value**: Variable value
   - **Environment**: Select "Production, Preview, Development"
4. Click "Save"

### Via Vercel CLI

```bash
vercel env add NEXTAUTH_SECRET
# Paste value when prompted
# Select Production, Preview, Development
```

---

## ✅ Verification Checklist

Before testing your app:

- [ ] `DATABASE_URL` is set (check deployment logs)
- [ ] `NEXTAUTH_URL` matches your Vercel URL
- [ ] `NEXTAUTH_SECRET` is set (32+ characters)
- [ ] `GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] Google OAuth redirect URI includes Vercel URL
- [ ] Database schema initialized (`npx prisma db push`)
- [ ] App builds successfully in Vercel
- [ ] Can access app at Vercel URL
- [ ] Can sign in with Google

---

## 🐛 Troubleshooting

### "Failed to connect to database"
- Check `DATABASE_URL` is set correctly
- Verify database is accessible
- Check for typos in connection string

### "Invalid client" during Google sign in
- Verify `GOOGLE_CLIENT_ID` matches Google Console
- Check redirect URI in Google Console matches exactly
- Ensure `NEXTAUTH_URL` is correct

### "Missing secret" error
- Set `NEXTAUTH_SECRET`
- Must be at least 32 characters
- Redeploy after adding

### "Prisma Client not found"
- Check `postinstall` script in package.json
- Verify build logs show "prisma generate"
- Try redeploying

---

## 📝 Example Values (DO NOT USE THESE)

```env
# Example - Replace with your actual values
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
NEXTAUTH_URL=https://jaunt-abc123.vercel.app
NEXTAUTH_SECRET=your-random-32-char-secret-here-use-openssl
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

---

## 🎯 Minimum Variables to Get Started

To get the app running with basic functionality:

```
DATABASE_URL=<from-vercel-postgres-or-supabase>
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
```

That's it! Email forwarding and Apple Sign In can be added later.

---

## 🚀 After Setting Variables

1. Redeploy (or Vercel will auto-redeploy)
2. Run `npx prisma db push` to initialize database
3. Visit your app URL
4. Click "Sign in with Google"
5. Create your first trip!

---

## 📚 More Help

- [QUICKSTART_VERCEL.md](./QUICKSTART_VERCEL.md) - Fast deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [SETUP.md](./SETUP.md) - Local development setup

Questions? Check the deployment guides above!
