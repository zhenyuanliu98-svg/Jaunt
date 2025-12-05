# Jaunt - Travel Itinerary Organizer

A clean, minimal web application for managing all your travel bookings in one unified timeline view.

## 🚀 Quick Deploy to Vercel

**Ready to deploy?** See [QUICKSTART_VERCEL.md](./QUICKSTART_VERCEL.md) for 5-minute deployment guide!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/jaunt)

**What you'll need:**
- Vercel account (free)
- PostgreSQL database (Vercel Postgres or Supabase free tier)
- Google OAuth credentials (free)
- 5 minutes

📖 **Deployment Guides:**
- [QUICKSTART_VERCEL.md](./QUICKSTART_VERCEL.md) - Fast deployment (5 min)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive guide
- [ENV_VARS_CHECKLIST.md](./ENV_VARS_CHECKLIST.md) - Environment variables reference

---

## Features

- **Trip Management**: Create, edit, and organize trips with destinations and dates
- **Booking Management**: Track flights, accommodations, car rentals, restaurants, activities, and more
- **Email Forwarding**: Forward confirmation emails to automatically parse and add bookings
- **Timeline View**: Beautiful chronological view of your entire itinerary
- **Trip Sharing**: Share view-only links with travel companions
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google & Apple OAuth)
- **Email**: SendGrid for inbound email parsing

## Getting Started

### For Production Deployment

See [QUICKSTART_VERCEL.md](./QUICKSTART_VERCEL.md) to deploy to Vercel in 5 minutes!

### For Local Development

**Prerequisites:**
- Node.js 18+
- PostgreSQL database
- Google OAuth credentials
- Apple Sign In credentials (optional)
- SendGrid account (for email forwarding feature)

**Installation:**

1. Clone and install:
```bash
git clone <repository-url>
cd jaunt
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Initialize database:
```bash
npx prisma generate
npx prisma db push
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

For detailed local setup instructions, see [SETUP.md](./SETUP.md)

## Project Structure

```
jaunt/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

- **[QUICKSTART_VERCEL.md](./QUICKSTART_VERCEL.md)** - Deploy to Vercel in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
- **[ENV_VARS_CHECKLIST.md](./ENV_VARS_CHECKLIST.md)** - Environment variables reference
- **[SETUP.md](./SETUP.md)** - Detailed local development setup
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture documentation

## Screenshots

### Dashboard
Clean overview of all your trips with upcoming and past sections.

### Timeline View
Beautiful day-by-day itinerary with color-coded bookings.

### Trip Sharing
Share read-only links with travel companions.

## Support

For questions or issues:
1. Check the documentation above
2. Review the code comments
3. Inspect the Prisma schema at `prisma/schema.prisma`

## License

Private - All rights reserved
