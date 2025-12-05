# Quick Start: Deploy to Vercel

## 5-Minute Deployment Guide

### 1. Push to GitHub

Your code is already committed. Make sure it's pushed:

```bash
git push
```

### 2. Deploy to Vercel

Go to [vercel.com/new](https://vercel.com/new) and:

1. Click "Import Project"
2. Select your GitHub repository `Jaunt`
3. Vercel auto-detects Next.js ✓
4. Click "Deploy"

### 3. Set Up Database

**Option A: Vercel Postgres** (Easiest)

1. In Vercel Dashboard → Storage → Create Database
2. Select "Postgres"
3. Name it "jaunt-db"
4. Click Create
5. Vercel auto-sets `DATABASE_URL` ✓

**Option B: Supabase** (Free tier generous)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Add as `DATABASE_URL` in Vercel

### 4. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
```

### 5. Set Up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add redirect: `https://your-app.vercel.app/api/auth/callback/google`
5. Copy Client ID & Secret to Vercel

### 6. Initialize Database

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull

# Initialize database
npx prisma generate
npx prisma db push
```

### 7. Done! 🎉

Visit `https://your-app.vercel.app`

---

## Optional: Email Forwarding

**Skip this for now** - you can add bookings manually!

To enable later, see [DEPLOYMENT.md](./DEPLOYMENT.md) for SendGrid setup.

---

## Troubleshooting

**Build failed?**
- Check build logs in Vercel
- Ensure all environment variables are set
- `NEXTAUTH_SECRET` must be set

**Can't sign in?**
- Verify Google OAuth redirect URI matches deployment URL
- Check `NEXTAUTH_URL` matches your Vercel URL

**Database error?**
- Make sure `DATABASE_URL` is set
- Run `npx prisma db push` to initialize schema

---

## What You Get

✅ Fully deployed Next.js app
✅ PostgreSQL database
✅ Google authentication
✅ Auto HTTPS/SSL
✅ Global CDN
✅ Auto-scaling
✅ Preview deployments for PRs

## Next Steps

1. Add custom domain (Settings → Domains)
2. Test creating trips and bookings
3. Share with friends!
4. (Optional) Set up email forwarding with SendGrid

Need help? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.
