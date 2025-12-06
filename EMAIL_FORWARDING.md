# Email Forwarding Setup Guide

This guide explains how to set up and use the email forwarding feature in Jaunt, which allows users to forward booking confirmation emails to a unique email address for automatic parsing and trip management.

## Overview

The email forwarding feature enables:
- Each user gets a unique forwarding email address (e.g., `abc12345@mail.jauntapp.org`)
- Users forward booking confirmation emails (flights, hotels, car rentals, etc.) to this address
- OpenAI GPT-4 intelligently extracts booking details from the email
- Parsed bookings appear in the user's pending bookings list for review
- Users can approve and add bookings to their trips

## Architecture

```
User forwards email
      ↓
SendGrid Inbound Parse (receives email)
      ↓
POST /api/email/inbound (webhook)
      ↓
Find user by forwarding email
      ↓
OpenAI GPT-4 parses email content
      ↓
Create pending booking in database
      ↓
User reviews and approves in UI
      ↓
Booking added to trip
```

## Prerequisites

1. **Domain**: A custom domain configured with SendGrid (e.g., `jauntapp.org`)
2. **SendGrid Account**: Free or paid SendGrid account
3. **OpenAI API Key**: OpenAI API access for email parsing
4. **Environment Variables**: Properly configured `.env` file

## Setup Steps

### 1. Configure SendGrid Inbound Parse

#### A. Verify Your Domain
1. Log in to [SendGrid](https://app.sendgrid.com/)
2. Go to **Settings** → **Sender Authentication**
3. Click **Authenticate Your Domain**
4. Follow the wizard to add DNS records to your domain provider
5. Wait for verification (usually takes a few minutes)

#### B. Set Up Inbound Parse
1. Go to **Settings** → **Inbound Parse**
2. Click **Add Host & URL**
3. Configure:
   - **Subdomain**: `mail` (or `forward`, `email`, etc.)
   - **Domain**: `jauntapp.org` (your custom domain)
   - **Destination URL**: `https://jauntapp.org/api/email/inbound`
   - **Check spam**: ✓ Check incoming emails for spam
   - **POST raw MIME**: Leave unchecked (we use parsed form data)
4. Click **Add**

**Important**: The subdomain you choose here (e.g., `mail`) must match the MX record subdomain you created in Step C.

#### C. Configure DNS (MX Records)

**IMPORTANT**: SendGrid requires you to use a **subdomain** for email forwarding, not the root domain.

Add an MX record for a subdomain (e.g., `mail.jauntapp.org`):

```
Type: MX
Host: mail (this creates mail.jauntapp.org)
Priority: 10
Value: mx.sendgrid.net
TTL: Auto
```

**Note**: You cannot use the root domain (@) for SendGrid Inbound Parse. You must use a subdomain like `mail`, `forward`, `email`, etc.

### 2. Configure Environment Variables

Update your `.env` file with the following:

```bash
# SendGrid
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Email Domain (where users forward emails) - MUST match SendGrid Inbound Parse subdomain
EMAIL_DOMAIN="mail.jauntapp.org"

# OpenAI API Key (for intelligent email parsing)
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Your app URL (for SendGrid webhook)
NEXTAUTH_URL="https://yourdomain.com"
```

#### Getting Your SendGrid API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: "Jaunt Email Forwarding"
4. Permissions: **Full Access** (or minimum: Mail Send + Inbound Parse)
5. Copy the key immediately (it won't be shown again)

#### Getting Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys**
3. Click **Create new secret key**
4. Name: "Jaunt Email Parser"
5. Copy the key (starts with `sk-`)

### 3. Deploy Your Application

The webhook endpoint `/api/email/inbound` must be publicly accessible for SendGrid to send emails to it.

#### For Local Development (Testing)
Use a tunneling service like **ngrok**:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start your Next.js app
npm run dev

# In another terminal, create a tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update SendGrid Inbound Parse with: https://abc123.ngrok.io/api/email/inbound
```

#### For Production
Deploy to Vercel, AWS, or your preferred hosting platform:

```bash
# Example: Vercel deployment
vercel --prod

# Use your production URL in SendGrid:
# https://yourdomain.com/api/email/inbound
```

### 4. Test the Setup

#### A. Check User's Forwarding Email
1. Sign in to Jaunt
2. Go to the Dashboard
3. Find the "Email Forwarding" card
4. Copy your unique forwarding email (e.g., `abc12345@mail.jauntapp.org`)

#### B. Send a Test Email
Forward a real booking confirmation email to your forwarding address, or send a test email:

**Sample Test Email (Flight Booking)**
```
To: abc12345@mail.jauntapp.org
Subject: Your Flight Confirmation - AA123

Dear Customer,

Your flight has been confirmed!

Confirmation Number: ABC123XYZ

Flight Details:
- Airline: American Airlines
- Flight Number: AA123
- Departure: JFK (New York) - December 15, 2025 at 10:30 AM
- Arrival: LAX (Los Angeles) - December 15, 2025 at 1:45 PM
- Passenger: John Doe

Total Cost: $350.00

Thank you for booking with us!
```

#### C. Verify Processing
1. Check your server logs for the webhook request
2. Go to **Dashboard** → **Pending Bookings** to review
3. You should see the parsed booking with extracted details

### 5. Troubleshooting

#### Email Not Received
1. **Check MX Records**: Use [MXToolbox](https://mxtoolbox.com/) to verify DNS
2. **Check SendGrid Logs**: Go to **Activity** → **Email Activity** in SendGrid
3. **Verify Webhook URL**: Ensure it's publicly accessible and returns 200 OK
4. **Check Domain Verification**: Ensure your domain is verified in SendGrid

#### Webhook Errors (500/404)
1. Check your server logs for error details
2. Ensure `/api/email/inbound/route.ts` exists
3. Test the endpoint manually:
   ```bash
   curl -X POST https://jauntapp.org/api/email/inbound \
     -F "to=test@jauntapp.org" \
     -F "from=booking@airline.com" \
     -F "subject=Flight Confirmation" \
     -F "text=Your flight is confirmed"
   ```

#### Parsing Errors
1. **Check OpenAI API Key**: Ensure it's valid and has credits
2. **View Logs**: Check console output for OpenAI errors
3. **Fallback Mode**: If OpenAI fails, the system uses regex-based parsing
4. **Rate Limits**: OpenAI has rate limits; consider upgrading your plan

#### User Not Found
1. Ensure the user exists in the database
2. Check that the `uniqueForwardEmail` field is set correctly
3. Verify the email address matches exactly (case-insensitive)

## How It Works

### Email Parsing with OpenAI

The system uses **GPT-4o-mini** to intelligently extract booking information:

```typescript
// Example parsed output
{
  "type": "FLIGHT",
  "date": "2025-12-15",
  "time": "10:30",
  "confirmationNumber": "ABC123XYZ",
  "cost": 350,
  "typeSpecificData": {
    "airline": "American Airlines",
    "flightNumber": "AA123",
    "departureAirport": "JFK",
    "arrivalAirport": "LAX",
    "departureTime": "10:30",
    "arrivalTime": "13:45"
  }
}
```

### Supported Booking Types

- **FLIGHT**: Airlines, flight numbers, airports, times
- **ACCOMMODATION**: Hotels, check-in/out dates, property details
- **CAR_RENTAL**: Car rental companies, pickup/dropoff locations
- **RESTAURANT**: Restaurant reservations, party size
- **ACTIVITY**: Tours, attractions, tickets
- **TRANSPORT**: Trains, buses, ferries

### Fallback Parsing

If OpenAI is unavailable or fails, the system uses regex-based pattern matching to extract basic information:
- Confirmation numbers
- Dates
- Flight numbers
- Booking types

## User Workflow

1. **Get Forwarding Email**: User signs up and receives unique email
2. **Forward Bookings**: User forwards confirmation emails from airlines, hotels, etc.
3. **Review Parsed Data**: User sees pending bookings with extracted details
4. **Approve & Add**: User reviews, edits if needed, and adds to trip
5. **Manage Trip**: Booking appears in trip timeline

## Security Considerations

- All emails are received via SendGrid's secure infrastructure
- Only authenticated users can access their pending bookings
- Forwarding emails are unique and hard to guess (8 random characters)
- Raw email HTML is truncated to 5000 characters to prevent database bloat
- OpenAI API calls use latest security best practices

## Cost Estimates

### SendGrid
- **Free Tier**: 100 emails/day forever
- **Essentials**: $19.95/month for 50,000 emails

### OpenAI
- **GPT-4o-mini**: ~$0.00015 per email (very cheap!)
- **Example**: 1,000 emails/month ≈ $0.15/month

## Advanced Configuration

### Custom Email Domains

If you want to use a different domain for each environment:

```bash
# Development
EMAIL_DOMAIN="dev.jauntapp.org"

# Production
EMAIL_DOMAIN="jauntapp.org"
```

**IMPORTANT**: The `EMAIL_DOMAIN` must exactly match the domain configured in SendGrid's Inbound Parse settings. If they don't match, emails will not be received.

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// In /api/email/inbound/route.ts
const rateLimiter = new RateLimiter({
  maxRequests: 100, // per user
  windowMs: 60 * 60 * 1000, // 1 hour
})
```

### Email Attachments

To support PDF attachments (e.g., boarding passes):

1. Enable file uploads in SendGrid Inbound Parse
2. Store files in cloud storage (S3, Cloudinary, etc.)
3. Link to bookings in the `attachments` table

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/yourusername/jaunt/issues)
- Review SendGrid's [Inbound Parse documentation](https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook)
- Check OpenAI's [API documentation](https://platform.openai.com/docs)
