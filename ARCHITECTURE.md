# Jaunt Architecture Documentation

## Overview

Jaunt is a full-stack Next.js application for managing travel itineraries. This document outlines the technical architecture and key design decisions.

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database access layer
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication

### External Services
- **Google OAuth** - User authentication
- **Apple Sign In** - User authentication (optional)
- **SendGrid Inbound Parse** - Email parsing

## Project Structure

```
Jaunt/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   ├── trips/        # Trip CRUD operations
│   │   │   ├── bookings/     # Booking operations
│   │   │   └── email/        # Email webhook
│   │   ├── dashboard/        # Dashboard page
│   │   ├── trips/           # Trip pages
│   │   ├── bookings/        # Booking pages
│   │   ├── shared/          # Shared trip view
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing/login page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── Layout/          # Layout components
│   │   ├── Trip/            # Trip-specific components
│   │   └── Booking/         # Booking-specific components
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client
│   │   ├── auth.ts          # Auth utilities
│   │   └── utils.ts         # Helper functions
│   └── types/
│       └── index.ts         # TypeScript types
├── .env.example             # Environment variables template
├── package.json             # Dependencies
└── tsconfig.json           # TypeScript config
```

## Data Model

### Core Entities

#### User
- Stores user information from OAuth providers
- Each user has a unique forwarding email address
- One-to-many relationship with Trips and PendingBookings

#### Trip
- Container for bookings with metadata (name, destination, dates)
- Optional share token for view-only access
- Belongs to one User, has many Bookings

#### Booking
- Represents a travel booking (flight, hotel, etc.)
- Type-specific data stored in JSON field for flexibility
- Belongs to one Trip, has many Attachments

#### PendingBooking
- Temporary storage for email-parsed bookings
- Status: PENDING, REVIEWED, or REJECTED
- User reviews and approves before converting to Booking

#### Attachment
- File attachments for bookings (PDFs, images)
- Belongs to one Booking

### Database Schema

See `prisma/schema.prisma` for the complete schema definition.

## Authentication Flow

```
┌─────────┐
│ User    │
└────┬────┘
     │ 1. Click "Sign in with Google"
     ▼
┌─────────────┐
│ NextAuth.js │
└──────┬──────┘
       │ 2. Redirect to Google OAuth
       ▼
┌──────────────┐
│ Google OAuth │
└──────┬───────┘
       │ 3. User approves
       ▼
┌─────────────┐
│ NextAuth.js │◄────────┐
└──────┬──────┘         │
       │ 4. Create/find user in DB
       │ 5. Generate unique forwarding email
       ▼                │
┌─────────────┐         │
│   Database  │─────────┘
└──────┬──────┘
       │ 6. Create session
       ▼
┌──────────┐
│ Dashboard│
└──────────┘
```

## Email Processing Flow

```
┌──────────────┐
│ User forwards│
│ email        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  SendGrid    │
│ Inbound Parse│
└──────┬───────┘
       │ Webhook: POST /api/email/inbound
       ▼
┌──────────────────┐
│ Parse email      │
│ - Detect type    │
│ - Extract fields │
│ - Find user      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Create           │
│ PendingBooking   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ User sees        │
│ notification     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ User reviews &   │
│ approves         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Create Booking   │
│ in Trip          │
└──────────────────┘
```

## API Routes

### Authentication
- `POST /api/auth/signin` - Initiate OAuth flow
- `GET /api/auth/callback/[provider]` - OAuth callback

### Trips
- `GET /api/trips` - List user's trips
- `POST /api/trips` - Create trip
- `GET /api/trips/[id]` - Get trip details
- `PATCH /api/trips/[id]` - Update trip
- `DELETE /api/trips/[id]` - Delete trip
- `POST /api/trips/[id]/share` - Generate share link
- `DELETE /api/trips/[id]/share` - Revoke share link

### Bookings
- `POST /api/trips/[id]/bookings` - Create booking
- `PATCH /api/bookings/pending/[id]` - Update pending booking status

### Email
- `POST /api/email/inbound` - SendGrid webhook

## Key Features Implementation

### Trip Management
- Server-side rendering for SEO and performance
- Optimistic UI updates for better UX
- Cascading deletes (deleting trip removes all bookings)

### Timeline View
- Bookings grouped by date
- Sorted chronologically
- Type-specific rendering based on booking type
- Color-coded by booking category

### Sharing
- Generate unique, unguessable share tokens
- View-only access (no authentication required)
- Tokens can be revoked by trip owner

### Email Parsing
- Basic pattern matching for common booking formats
- Extensible design for AI/ML integration
- Fallback to manual review if parsing fails

## Security Considerations

### Authentication
- OAuth 2.0 for secure authentication
- Session-based auth with NextAuth.js
- No password storage

### Data Access
- Row-level security via userId checks
- All API routes verify user ownership
- Share tokens are randomly generated (32 chars)

### Input Validation
- Required fields enforced in forms
- Type checking with TypeScript
- Prisma validates data types

### Environment Variables
- Sensitive data in environment variables
- `.env` excluded from version control
- Example file provided for reference

## Performance Optimizations

### Database
- Indexed fields for fast queries (userId, date, status)
- Eager loading with Prisma includes
- Connection pooling

### Frontend
- Server-side rendering for initial page load
- React Server Components where applicable
- Optimistic UI updates
- Image optimization with Next.js

### Caching
- NextAuth.js handles session caching
- Static pages cached by Vercel/CDN

## Scalability Considerations

### Database
- PostgreSQL supports millions of rows
- Can add read replicas if needed
- Consider partitioning trips by date

### File Storage
- Currently attachments stored in DB (URLs)
- Should migrate to S3/Cloudinary for production
- Implement signed URLs for security

### Email Processing
- SendGrid webhook scales automatically
- Can add queue (Redis/BullMQ) for heavy load
- Consider background job processing

## Future Enhancements

### MVP+
- File upload for booking attachments
- Calendar sync (Google Calendar, Apple Calendar)
- Export to PDF
- Map view of bookings

### Advanced Features
- Collaborative trips (multi-user editing)
- Real-time updates with WebSockets
- Mobile app (React Native)
- Offline support with service workers

### Integrations
- Direct API connections to booking platforms
- Flight status tracking
- Weather forecasts
- Currency conversion

## Development Workflow

### Local Development
1. Start PostgreSQL
2. Run `npm run dev`
3. Access at `http://localhost:3000`
4. Use Prisma Studio for database inspection

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma format`
3. Run `npx prisma db push` (dev) or `npx prisma migrate dev` (prod)
4. Run `npx prisma generate`

### Deployment
1. Push to GitHub
2. Vercel auto-deploys from main branch
3. Run migrations in production
4. Verify environment variables

## Monitoring and Logging

### Application Logs
- Console logging for development
- Should add structured logging (Winston/Pino) for production

### Error Tracking
- Consider Sentry for error tracking
- Log API errors with context

### Analytics
- Can add Plausible or Google Analytics
- Track key metrics: trips created, bookings added, shares generated

## Testing Strategy

### Unit Tests
- Test utility functions in `lib/utils.ts`
- Test email parsing logic
- Use Jest + React Testing Library

### Integration Tests
- Test API routes with Supertest
- Test database operations with test database

### E2E Tests
- Use Playwright or Cypress
- Test critical user flows (create trip, add booking)

## Dependencies

### Core
- `next` - Framework
- `react` - UI library
- `prisma` - ORM
- `next-auth` - Authentication

### UI
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `date-fns` - Date formatting

### Utilities
- `zod` - Runtime validation
- `clsx` + `tailwind-merge` - Class name utilities

## Environment Setup

See `.env.example` for required environment variables.

## Conclusion

Jaunt is built with modern web technologies and follows best practices for security, performance, and maintainability. The architecture is designed to be scalable and extensible for future enhancements.
