# Deploying Jaunt to Vercel

This guide will walk you through deploying Jaunt to Vercel.

## Prerequisites

- GitHub account with this repository
- Vercel account (sign up at https://vercel.com)
- PostgreSQL database (we'll use Vercel Postgres)

## Step 1: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a name (e.g., "jaunt-db")
6. Select a region close to your users
7. Click "Create"

Vercel will automatically set the `POSTGRES_URL` environment variable for you.

### Option B: External PostgreSQL (Supabase, Railway, etc.)

If using an external provider:
1. Create a PostgreSQL database with your provider
2. Get the connection string (usually in format: `postgresql://user:password@host:port/database`)
3. You'll add this as `DATABASE_URL` in Vercel environment variables

## Step 2: Set Up OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Application type: Web application
6. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google` (if using custom domain)
7. Save the Client ID and Client Secret

### Apple Sign In (Optional)

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID with "Sign in with Apple" enabled
3. Create a Service ID
4. Add redirect URLs:
   - `https://your-app.vercel.app/api/auth/callback/apple`
5. Generate a key for "Sign in with Apple"
6. Save all credentials

## Step 3: Set Up SendGrid (Optional - for email forwarding)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get your API key from Settings → API Keys
3. Set up Inbound Parse:
   - Go to Settings → Inbound Parse
   - Add hostname: use SendGrid's or your own domain
   - Add URL: `https://your-app.vercel.app/api/email/inbound`
4. Configure MX records if using custom domain

## Step 4: Deploy to Vercel

### Using Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Click "Deploy"

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts
```

## Step 5: Configure Environment Variables

In your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add the following variables:

### Required Variables

```
# Database (if using Vercel Postgres, this is auto-set)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Optional Variables (for full features)

```
# Apple OAuth
APPLE_ID=your-apple-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_PRIVATE_KEY=your-apple-private-key
APPLE_KEY_ID=your-apple-key-id

# SendGrid (for email forwarding)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_DOMAIN=jaunt.app
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Step 6: Initialize Database

After deployment, you need to initialize your database:

### Using Vercel CLI

```bash
# Connect to your project
vercel link

# Set environment variables locally
vercel env pull

# Run Prisma commands
npx prisma generate
npx prisma db push
```

### Alternative: Using GitHub Actions

You can set up a GitHub Action to run migrations on deployment. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx prisma generate
      - run: npx prisma db push
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Step 7: Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update OAuth redirect URIs to include your custom domain

## Step 8: Update OAuth Redirect URIs

After deployment, update your OAuth providers:

### Google
- Add `https://your-app.vercel.app/api/auth/callback/google`
- Add `https://your-domain.com/api/auth/callback/google` (if custom domain)

### Apple
- Add `https://your-app.vercel.app/api/auth/callback/apple`
- Add `https://your-domain.com/api/auth/callback/apple` (if custom domain)

### SendGrid
- Update webhook URL to `https://your-app.vercel.app/api/email/inbound`

## Step 9: Test Your Deployment

1. Visit your deployed URL: `https://your-app.vercel.app`
2. Test Google Sign In
3. Create a test trip
4. Add a test booking
5. Test sharing a trip
6. (Optional) Test email forwarding

## Troubleshooting

### Build Failures

**Error: Prisma Client not generated**
- Solution: Make sure `vercel.json` includes `prisma generate` in build command
- Or add a `postinstall` script in `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```

**Error: Database connection failed**
- Check `DATABASE_URL` is correctly set in environment variables
- Ensure database is accessible from Vercel's IP addresses
- For Vercel Postgres, make sure you're using the pooled connection URL

### Authentication Issues

**OAuth redirect mismatch**
- Verify redirect URIs in Google/Apple match exactly
- Include both `.vercel.app` and custom domain URLs
- Ensure `NEXTAUTH_URL` matches your deployment URL

**Session not persisting**
- Verify `NEXTAUTH_SECRET` is set
- Check cookie settings in browser
- Ensure HTTPS is enabled (Vercel does this automatically)

### Database Issues

**Prisma migrations failing**
- Use `npx prisma db push` for development
- For production, use `npx prisma migrate deploy`
- Ensure database URL is correct

### Email Forwarding Not Working

**Webhook not receiving emails**
- Verify SendGrid webhook URL is correct
- Check SendGrid logs for errors
- Ensure endpoint is publicly accessible
- Verify MX records are configured correctly

## Environment Variables Checklist

Before going live, ensure you have:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your deployed URL
- [ ] `NEXTAUTH_SECRET` - Random secret (32+ characters)
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] `SENDGRID_API_KEY` - (Optional) For email forwarding
- [ ] `EMAIL_DOMAIN` - (Optional) Your email domain

## Performance Optimization

### Edge Functions

Consider using Edge Runtime for some API routes:

```typescript
// src/app/api/trips/route.ts
export const runtime = 'edge' // 'nodejs' (default) | 'edge'
```

### Database Connection Pooling

For better performance, use connection pooling:

```
DATABASE_URL=postgresql://...?pgbouncer=true
```

### Image Optimization

If you add image uploads later, use Vercel's Image Optimization:

```typescript
import Image from 'next/image'

<Image
  src="/path-to-image.jpg"
  alt="Description"
  width={500}
  height={300}
/>
```

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in your project settings for:
- Page views
- Performance metrics
- Real User Monitoring

### Error Tracking

Consider adding Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Branch Deployments

Every branch gets a unique URL:
- `https://jaunt-git-feature-branch-username.vercel.app`

### Environment-Specific Variables

Set different values for preview vs production:
1. Go to Settings → Environment Variables
2. Select appropriate environment (Production/Preview/Development)

## Rollback

If something goes wrong:

1. Go to Deployments tab
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Scaling

Vercel automatically scales based on traffic. No configuration needed!

- Automatic scaling
- Global CDN
- Edge network
- Zero-config HTTPS

## Cost Estimation

**Vercel Pro Plan** (~$20/month):
- Unlimited deployments
- 100GB bandwidth
- Advanced analytics
- Team collaboration

**Database** (Vercel Postgres):
- Hobby: Free (256 MB)
- Pro: $20/month (512 MB)
- Scale as needed

**SendGrid**:
- Free: 100 emails/day
- Essentials: $19.95/month (50k emails)

## Next Steps After Deployment

1. [ ] Set up custom domain
2. [ ] Configure email forwarding with your domain
3. [ ] Set up monitoring and alerts
4. [ ] Create backup strategy for database
5. [ ] Add analytics
6. [ ] Set up error tracking
7. [ ] Configure CORS if needed
8. [ ] Test all features in production
9. [ ] Create documentation for users
10. [ ] Share with early users!

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## Deployment Checklist

Before launching to users:

- [ ] Database is set up and migrations run
- [ ] All environment variables configured
- [ ] OAuth providers configured with production URLs
- [ ] Email forwarding tested (if using)
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active (auto via Vercel)
- [ ] Test user signup flow
- [ ] Test trip creation and booking
- [ ] Test sharing functionality
- [ ] Test on mobile devices
- [ ] Test PWA installation
- [ ] Error monitoring set up
- [ ] Analytics enabled
- [ ] Backup strategy in place

---

Your Jaunt app is now live! 🎉

Access it at: `https://your-app.vercel.app`
