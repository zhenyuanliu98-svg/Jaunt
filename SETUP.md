# Jaunt Setup Guide

This guide will help you set up and run the Jaunt travel itinerary organizer application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **PostgreSQL** 14.x or higher
- **Git**

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Jaunt
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up the Database

### Create a PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE jaunt;

# Exit psql
\q
```

### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update with your values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jaunt"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Google OAuth
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Apple OAuth (optional)
APPLE_ID="<your-apple-id>"
APPLE_TEAM_ID="<your-apple-team-id>"
APPLE_PRIVATE_KEY="<your-apple-private-key>"
APPLE_KEY_ID="<your-apple-key-id>"

# Email Processing
SENDGRID_API_KEY="<your-sendgrid-api-key>"
EMAIL_DOMAIN="jaunt.app"
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value in `.env`.

### Initialize the Database

```bash
npx prisma generate
npx prisma db push
```

## Step 4: Set Up OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret to your `.env` file

### Apple Sign In (Optional)

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID and enable "Sign in with Apple"
3. Create a Service ID
4. Configure the redirect URL: `http://localhost:3000/api/auth/callback/apple`
5. Generate a key for "Sign in with Apple"
6. Add the credentials to your `.env` file

## Step 5: Set Up Email Forwarding (Optional)

To enable the email forwarding feature, you'll need to set up SendGrid Inbound Parse:

1. Sign up for [SendGrid](https://sendgrid.com/)
2. Go to Settings > Inbound Parse
3. Add a new hostname and URL:
   - Hostname: `<your-domain>` or use SendGrid's domain
   - URL: `https://your-app.com/api/email/inbound`
4. Configure your DNS MX records to point to SendGrid
5. Add your SendGrid API key to `.env`

For development, you can skip this step and test with manual booking entry.

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Create Your First Account

1. Click "Sign in with Google" (or Apple)
2. Complete the OAuth flow
3. You'll be redirected to the dashboard
4. Note your unique forwarding email address (shown on the dashboard)

## Step 8: Create a Trip

1. Click "New Trip"
2. Fill in the trip details:
   - Trip Name: "Japan Adventure 2024"
   - Destination: "Tokyo, Japan"
   - Start Date: Select a date
   - End Date: Select a date
3. Click "Create Trip"

## Step 9: Add Bookings

You can add bookings in two ways:

### Manual Entry

1. Open your trip
2. Click "Add Booking"
3. Select the booking type (Flight, Accommodation, etc.)
4. Fill in the details
5. Click "Add Booking"

### Email Forwarding (if configured)

1. Forward a booking confirmation email to your unique Jaunt email
2. Wait for the email to be processed (usually < 1 minute)
3. Log in to see pending bookings
4. Review and approve the booking

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format Prisma schema
npx prisma format

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. Verify PostgreSQL is running: `pg_isready`
2. Check your `DATABASE_URL` in `.env`
3. Ensure the database exists: `psql -l | grep jaunt`

### OAuth Issues

If authentication isn't working:

1. Verify your redirect URIs match exactly
2. Check that the OAuth provider is enabled
3. Ensure `NEXTAUTH_URL` matches your development URL

### Email Forwarding Not Working

1. Verify SendGrid Inbound Parse is configured
2. Check that your MX records are correct
3. Look at SendGrid logs for parsing errors
4. Ensure your app is publicly accessible (for webhooks)

## Production Deployment

### Recommended Platforms

- **Vercel** (easiest for Next.js)
- **Railway** (good for full-stack with database)
- **AWS** (most flexible but complex)

### Deployment Checklist

- [ ] Set up production database (e.g., Railway PostgreSQL, Supabase)
- [ ] Configure environment variables in hosting platform
- [ ] Update OAuth redirect URIs to production URLs
- [ ] Configure SendGrid with production webhook URL
- [ ] Set up custom domain
- [ ] Run database migrations: `npx prisma db push`
- [ ] Test authentication flow
- [ ] Test email forwarding

### Environment Variables for Production

Make sure to set all environment variables from `.env.example` in your hosting platform's dashboard.

## Support

For issues or questions:
- Check the [README.md](./README.md)
- Review the code comments
- Check the Prisma schema in `prisma/schema.prisma`

## Next Steps

Now that Jaunt is set up, you can:

1. Create multiple trips
2. Add various types of bookings
3. Share trip itineraries with friends
4. Forward booking emails to auto-populate trips
5. Customize the UI and add features

Enjoy using Jaunt! ✈️
